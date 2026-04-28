package com.group77.backend.service;

import com.group77.backend.dto.BookingApprovalDto;
import com.group77.backend.dto.AssetAvailabilityDto;
import com.group77.backend.dto.AvailableTimeSlotDto;
import com.group77.backend.dto.BookingQrValidationResponseDto;
import com.group77.backend.dto.BookingRequestDto;
import com.group77.backend.dto.BookingResponseDto;
import com.group77.backend.entity.Asset;
import com.group77.backend.entity.Booking;
import com.group77.backend.entity.User;
import com.group77.backend.enums.AssetStatus;
import com.group77.backend.enums.BookingStatus;
import com.group77.backend.repository.BookingRepository;
import com.group77.backend.repository.AssetRepository;
import com.group77.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final DateTimeFormatter SLOT_LABEL_FORMATTER = DateTimeFormatter.ofPattern("MMM d, h:mm a");
    private static final LocalTime DEFAULT_OPEN_TIME = LocalTime.of(8, 0);
    private static final LocalTime DEFAULT_CLOSE_TIME = LocalTime.of(18, 0);
    private static final int SLOT_INCREMENT_MINUTES = 30;
    private static final int DEFAULT_SUGGESTION_LIMIT = 3;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    /**
     * Create a new booking
     */
    public BookingResponseDto createBooking(Long userId, BookingRequestDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Asset asset = assetRepository.findById(dto.getAssetId())
                .orElseThrow(() -> new RuntimeException("Asset not found"));

        validateBookingWindow(dto.getStartTime(), dto.getEndTime());
        validateAssetAvailability(asset, dto.getExpectedAttendees(), dto.getStartTime(), dto.getEndTime());

        // Check for scheduling conflicts
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                dto.getAssetId(),
                dto.getStartTime(),
                dto.getEndTime()
        );

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Booking time slot conflicts with an existing booking");
        }

        Booking booking = Booking.builder()
                .user(user)
                .asset(asset)
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .purpose(dto.getPurpose())
                .expectedAttendees(dto.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .build();

        Booking saved = bookingRepository.save(booking);
        return convertToDto(saved);
    }

    /**
     * Get all bookings by user
     */
    public List<BookingResponseDto> getUserBookings(Long userId) {
        List<Booking> bookings = bookingRepository.findByUserId(userId);
        return bookings.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    /**
     * Get all bookings (admin only)
     */
    public List<BookingResponseDto> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAll();
        return bookings.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    /**
     * Get booking by ID
     */
    public BookingResponseDto getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return convertToDto(booking);
    }

    /**
     * Approve or reject a booking
     */
    public BookingResponseDto approveOrRejectBooking(Long bookingId, BookingApprovalDto dto) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only pending bookings can be reviewed");
        }

        if (dto.getApproved()) {
            validateAssetAvailability(
                    booking.getAsset(),
                    booking.getExpectedAttendees(),
                    booking.getStartTime(),
                    booking.getEndTime()
            );

            List<Booking> conflicts = bookingRepository.findConflictingBookingsExcludingBooking(
                    booking.getAsset().getId(),
                    booking.getStartTime(),
                    booking.getEndTime(),
                    booking.getId()
            );

            if (!conflicts.isEmpty()) {
                throw new RuntimeException("Booking cannot be approved because the resource is no longer available for that time slot");
            }

            booking.setStatus(BookingStatus.APPROVED);
            booking.setRejectionReason(null);
            booking.setQrToken(generateQrToken());
            booking.setQrIssuedAt(LocalDateTime.now());
        } else {
            if (dto.getRejectionReason() == null || dto.getRejectionReason().trim().isEmpty()) {
                throw new RuntimeException("Rejection reason is required");
            }
            booking.setStatus(BookingStatus.REJECTED);
            booking.setRejectionReason(dto.getRejectionReason().trim());
            booking.setQrToken(null);
            booking.setQrIssuedAt(null);
        }

        Booking updated = bookingRepository.save(booking);
        return convertToDto(updated);
    }

    /**
     * Cancel a booking
     */
    public BookingResponseDto cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.APPROVED) {
            throw new RuntimeException("Only pending or approved bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setQrToken(null);
        booking.setQrIssuedAt(null);
        Booking updated = bookingRepository.save(booking);
        return convertToDto(updated);
    }

    public BookingQrValidationResponseDto validateQrToken(String qrToken) {
        Booking booking = bookingRepository.findByQrToken(qrToken).orElse(null);

        if (booking == null) {
            return BookingQrValidationResponseDto.builder()
                    .valid(false)
                    .message("QR code not found")
                    .validatedAt(LocalDateTime.now())
                    .build();
        }

        if (booking.getStatus() != BookingStatus.APPROVED) {
            return BookingQrValidationResponseDto.builder()
                    .valid(false)
                    .message("Booking is not currently approved")
                    .bookingId(booking.getId())
                    .assetName(booking.getAsset().getName())
                    .userName(booking.getUser().getFullName())
                    .status(booking.getStatus())
                    .startTime(booking.getStartTime())
                    .endTime(booking.getEndTime())
                    .validatedAt(LocalDateTime.now())
                    .build();
        }

        return BookingQrValidationResponseDto.builder()
                .valid(true)
                .message("Approved booking verified")
                .bookingId(booking.getId())
                .assetName(booking.getAsset().getName())
                .userName(booking.getUser().getFullName())
                .status(booking.getStatus())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .validatedAt(LocalDateTime.now())
                .build();
    }

    public List<AssetAvailabilityDto> getAvailableResources(
            LocalDateTime startTime,
            LocalDateTime endTime,
            Integer expectedAttendees
    ) {
        validateBookingWindow(startTime, endTime);

        return assetRepository.findAll().stream()
                .map(asset -> buildAssetAvailability(asset, startTime, endTime, expectedAttendees))
                .sorted(Comparator
                        .comparing(AssetAvailabilityDto::isAvailable).reversed()
                        .thenComparing(AssetAvailabilityDto::getAssetName, String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());
    }

    public List<AvailableTimeSlotDto> getAvailableTimeSlots(
            Long assetId,
            LocalDate date,
            Integer durationMinutes,
            Integer expectedAttendees
    ) {
        if (date == null) {
            throw new RuntimeException("Date is required");
        }

        if (durationMinutes == null || durationMinutes <= 0) {
            throw new RuntimeException("Duration must be a positive number of minutes");
        }

        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Asset not found"));

        List<TimeWindow> windows = parseAvailabilityWindows(asset.getAvailabilityWindows(), date);
        List<AvailableTimeSlotDto> availableSlots = new ArrayList<>();

        for (TimeWindow window : windows) {
            LocalDateTime slotStart = window.start();
            while (!slotStart.plusMinutes(durationMinutes).isAfter(window.end())) {
                LocalDateTime slotEnd = slotStart.plusMinutes(durationMinutes);
                if (isAssetAvailableForWindow(asset, expectedAttendees, slotStart, slotEnd)) {
                    availableSlots.add(toSlotDto(slotStart, slotEnd));
                }
                slotStart = slotStart.plusMinutes(SLOT_INCREMENT_MINUTES);
            }
        }

        return availableSlots;
    }

    private void validateBookingWindow(LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime == null || endTime == null) {
            throw new RuntimeException("Start time and end time are required");
        }

        if (!endTime.isAfter(startTime)) {
            throw new RuntimeException("End time must be after start time");
        }
    }

    private void validateAssetAvailability(
            Asset asset,
            Integer expectedAttendees,
            LocalDateTime startTime,
            LocalDateTime endTime
    ) {
        if (asset.getStatus() != AssetStatus.ACTIVE) {
            throw new RuntimeException("Selected resource is currently unavailable");
        }

        if (expectedAttendees != null && expectedAttendees > asset.getCapacity()) {
            throw new RuntimeException("Selected resource does not have enough capacity");
        }

        if (!fitsWithinAvailabilityWindows(asset, startTime, endTime)) {
            throw new RuntimeException("Selected resource is outside its available hours");
        }
    }

    private AssetAvailabilityDto buildAssetAvailability(
            Asset asset,
            LocalDateTime startTime,
            LocalDateTime endTime,
            Integer expectedAttendees
    ) {
        boolean active = asset.getStatus() == AssetStatus.ACTIVE;
        boolean capacityOk = expectedAttendees == null || expectedAttendees <= asset.getCapacity();
        boolean withinWindow = fitsWithinAvailabilityWindows(asset, startTime, endTime);
        boolean conflictFree = bookingRepository.findConflictingBookings(asset.getId(), startTime, endTime).isEmpty();

        boolean available = active && capacityOk && withinWindow && conflictFree;
        String message;

        if (!active) {
            message = "Out of service";
        } else if (!capacityOk) {
            message = "Not enough capacity";
        } else if (!withinWindow) {
            message = "Outside available hours";
        } else if (!conflictFree) {
            message = "Conflicts with another booking";
        } else {
            message = "Available";
        }

        return AssetAvailabilityDto.builder()
                .assetId(asset.getId())
                .assetName(asset.getName())
                .assetType(asset.getType())
                .location(asset.getLocation())
                .capacity(asset.getCapacity())
                .status(asset.getStatus())
                .availabilityWindows(asset.getAvailabilityWindows())
                .available(available)
                .message(message)
                .suggestedTimeSlots(available
                        ? List.of()
                        : getSuggestedTimeSlots(asset, startTime.toLocalDate(), startTime, endTime, expectedAttendees))
                .build();
    }

    private List<AvailableTimeSlotDto> getSuggestedTimeSlots(
            Asset asset,
            LocalDate date,
            LocalDateTime requestedStart,
            LocalDateTime requestedEnd,
            Integer expectedAttendees
    ) {
        long durationMinutes = Duration.between(requestedStart, requestedEnd).toMinutes();
        if (durationMinutes <= 0) {
            return List.of();
        }

        return getAvailableTimeSlots(asset.getId(), date, (int) durationMinutes, expectedAttendees).stream()
                .filter(slot -> !slot.getStartTime().equals(requestedStart) || !slot.getEndTime().equals(requestedEnd))
                .limit(DEFAULT_SUGGESTION_LIMIT)
                .collect(Collectors.toList());
    }

    private boolean isAssetAvailableForWindow(
            Asset asset,
            Integer expectedAttendees,
            LocalDateTime startTime,
            LocalDateTime endTime
    ) {
        if (asset.getStatus() != AssetStatus.ACTIVE) {
            return false;
        }

        if (expectedAttendees != null && expectedAttendees > asset.getCapacity()) {
            return false;
        }

        if (!fitsWithinAvailabilityWindows(asset, startTime, endTime)) {
            return false;
        }

        return bookingRepository.findConflictingBookings(asset.getId(), startTime, endTime).isEmpty();
    }

    private boolean fitsWithinAvailabilityWindows(Asset asset, LocalDateTime startTime, LocalDateTime endTime) {
        List<TimeWindow> windows = parseAvailabilityWindows(asset.getAvailabilityWindows(), startTime.toLocalDate());
        return windows.stream().anyMatch(window ->
                !startTime.isBefore(window.start()) && !endTime.isAfter(window.end()));
    }

    private List<TimeWindow> parseAvailabilityWindows(String availabilityWindows, LocalDate date) {
        if (availabilityWindows == null || availabilityWindows.isBlank()) {
            return List.of(new TimeWindow(date.atTime(DEFAULT_OPEN_TIME), date.atTime(DEFAULT_CLOSE_TIME)));
        }

        List<TimeWindow> windows = new ArrayList<>();
        String[] segments = availabilityWindows.split("[,;]");

        for (String segment : segments) {
            String[] bounds = segment.trim().split("-");
            if (bounds.length != 2) {
                continue;
            }

            try {
                LocalTime start = LocalTime.parse(bounds[0].trim());
                LocalTime end = LocalTime.parse(bounds[1].trim());
                if (end.isAfter(start)) {
                    windows.add(new TimeWindow(date.atTime(start), date.atTime(end)));
                }
            } catch (DateTimeParseException ignored) {
                // Ignore malformed windows and fall back to defaults if nothing valid is left.
            }
        }

        if (windows.isEmpty()) {
            return List.of(new TimeWindow(date.atTime(DEFAULT_OPEN_TIME), date.atTime(DEFAULT_CLOSE_TIME)));
        }

        return windows;
    }

    private AvailableTimeSlotDto toSlotDto(LocalDateTime startTime, LocalDateTime endTime) {
        return AvailableTimeSlotDto.builder()
                .startTime(startTime)
                .endTime(endTime)
                .label(startTime.format(SLOT_LABEL_FORMATTER) + " - " + endTime.format(DateTimeFormatter.ofPattern("h:mm a")))
                .build();
    }

    private String generateQrToken() {
        byte[] bytes = new byte[12];
        SECURE_RANDOM.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private String buildQrCodeValue(Booking booking) {
        if (booking.getStatus() != BookingStatus.APPROVED || booking.getQrToken() == null || booking.getQrToken().isBlank()) {
            return null;
        }

        return String.format("%s/bookings/qr/%s", frontendUrl, booking.getQrToken());
    }

    /**
     * Convert Booking entity to DTO
     */
    private BookingResponseDto convertToDto(Booking booking) {
        return BookingResponseDto.builder()
                .id(booking.getId())
                .userId(booking.getUser().getId())
                .userName(booking.getUser().getFullName())
                .assetId(booking.getAsset().getId())
                .assetName(booking.getAsset().getName())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .expectedAttendees(booking.getExpectedAttendees())
                .status(booking.getStatus())
                .rejectionReason(booking.getRejectionReason())
                .qrCodeValue(buildQrCodeValue(booking))
                .qrIssuedAt(booking.getQrIssuedAt())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }

    private record TimeWindow(LocalDateTime start, LocalDateTime end) {
    }
}
