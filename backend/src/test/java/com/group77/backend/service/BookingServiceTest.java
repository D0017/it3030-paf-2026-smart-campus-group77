package com.group77.backend.service;

import com.group77.backend.dto.BookingApprovalDto;
import com.group77.backend.dto.BookingRequestDto;
import com.group77.backend.dto.BookingResponseDto;
import com.group77.backend.entity.Asset;
import com.group77.backend.entity.Booking;
import com.group77.backend.entity.User;
import com.group77.backend.enums.BookingStatus;
import com.group77.backend.repository.AssetRepository;
import com.group77.backend.repository.BookingRepository;
import com.group77.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private AssetRepository assetRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BookingService bookingService;

    private User user;
    private Asset asset;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .fullName("Admin User")
                .build();

        asset = new Asset();
        asset.setId(10L);
        asset.setName("Conference Room A");
    }

    @Test
    void createBookingRejectsInvalidTimeWindow() {
        BookingRequestDto request = new BookingRequestDto();
        request.setAssetId(asset.getId());
        request.setStartTime(LocalDateTime.of(2026, 5, 1, 11, 0));
        request.setEndTime(LocalDateTime.of(2026, 5, 1, 10, 0));
        request.setPurpose("Workshop");
        request.setExpectedAttendees(12);

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(assetRepository.findById(asset.getId())).thenReturn(Optional.of(asset));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> bookingService.createBooking(user.getId(), request)
        );

        assertEquals("End time must be after start time", exception.getMessage());
        verify(bookingRepository, never()).findConflictingBookings(any(), any(), any());
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void approveOrRejectBookingRejectsNonPendingBooking() {
        Booking booking = Booking.builder()
                .id(5L)
                .user(user)
                .asset(asset)
                .startTime(LocalDateTime.of(2026, 5, 1, 9, 0))
                .endTime(LocalDateTime.of(2026, 5, 1, 10, 0))
                .purpose("Department sync")
                .expectedAttendees(8)
                .status(BookingStatus.APPROVED)
                .build();

        BookingApprovalDto approval = new BookingApprovalDto();
        approval.setApproved(Boolean.FALSE);
        approval.setRejectionReason("Already confirmed");

        when(bookingRepository.findById(booking.getId())).thenReturn(Optional.of(booking));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> bookingService.approveOrRejectBooking(booking.getId(), approval)
        );

        assertEquals("Only pending bookings can be reviewed", exception.getMessage());
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void approveOrRejectBookingRequiresReasonForRejection() {
        Booking booking = Booking.builder()
                .id(6L)
                .user(user)
                .asset(asset)
                .startTime(LocalDateTime.of(2026, 5, 2, 9, 0))
                .endTime(LocalDateTime.of(2026, 5, 2, 10, 0))
                .purpose("Lab setup")
                .expectedAttendees(5)
                .status(BookingStatus.PENDING)
                .build();

        BookingApprovalDto approval = new BookingApprovalDto();
        approval.setApproved(Boolean.FALSE);
        approval.setRejectionReason("   ");

        when(bookingRepository.findById(booking.getId())).thenReturn(Optional.of(booking));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> bookingService.approveOrRejectBooking(booking.getId(), approval)
        );

        assertEquals("Rejection reason is required", exception.getMessage());
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void cancelBookingRejectsCompletedBooking() {
        Booking booking = Booking.builder()
                .id(7L)
                .user(user)
                .asset(asset)
                .startTime(LocalDateTime.of(2026, 5, 3, 14, 0))
                .endTime(LocalDateTime.of(2026, 5, 3, 15, 0))
                .purpose("Final review")
                .expectedAttendees(3)
                .status(BookingStatus.REJECTED)
                .build();

        when(bookingRepository.findById(booking.getId())).thenReturn(Optional.of(booking));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> bookingService.cancelBooking(booking.getId())
        );

        assertEquals("Only pending or approved bookings can be cancelled", exception.getMessage());
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void approveOrRejectBookingApprovesPendingBooking() {
        Booking booking = Booking.builder()
                .id(8L)
                .user(user)
                .asset(asset)
                .startTime(LocalDateTime.of(2026, 5, 4, 10, 0))
                .endTime(LocalDateTime.of(2026, 5, 4, 11, 0))
                .purpose("Project meeting")
                .expectedAttendees(6)
                .status(BookingStatus.PENDING)
                .rejectionReason("Old reason")
                .build();

        BookingApprovalDto approval = new BookingApprovalDto();
        approval.setApproved(Boolean.TRUE);

        when(bookingRepository.findById(booking.getId())).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookingResponseDto response = bookingService.approveOrRejectBooking(booking.getId(), approval);

        assertEquals(BookingStatus.APPROVED, response.getStatus());
        assertNull(response.getRejectionReason());
        verify(bookingRepository).save(booking);
    }
}
