package com.group77.backend.controller;

import com.group77.backend.dto.BookingApprovalDto;
import com.group77.backend.dto.BookingRequestDto;
import com.group77.backend.dto.BookingResponseDto;
import com.group77.backend.dto.ErrorResponse;
import com.group77.backend.entity.User;
import com.group77.backend.service.BookingService;
import com.group77.backend.service.CurrentUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private CurrentUserService currentUserService;

    /**
     * POST: Create a new booking
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> createBooking(
            @RequestBody BookingRequestDto dto,
            Authentication authentication,
            @RequestHeader(value = "X-USER-EMAIL", required = false) String emailHeader) {
        try {
            User user = currentUserService.resolveCurrentUser(authentication, emailHeader);
            BookingResponseDto booking = bookingService.createBooking(user.getId(), dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(booking);
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * GET: Get all bookings (admin) or user's own bookings
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<BookingResponseDto>> getBookings(
            Authentication authentication,
            @RequestHeader(value = "X-USER-EMAIL", required = false) String emailHeader) {
        try {
            User user = currentUserService.resolveCurrentUser(authentication, emailHeader);
            List<BookingResponseDto> bookings;

            if (user.getRole().name().equals("ADMIN")) {
                bookings = bookingService.getAllBookings();
            } else {
                bookings = bookingService.getUserBookings(user.getId());
            }

            return ResponseEntity.ok(bookings);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    /**
     * GET: Get a specific booking by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<BookingResponseDto> getBookingById(@PathVariable Long id) {
        try {
            BookingResponseDto booking = bookingService.getBookingById(id);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * PUT: Approve or reject a booking (admin only)
     */
    @PutMapping("/{id}/approval")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDto> approveOrRejectBooking(
            @PathVariable Long id,
            @RequestBody BookingApprovalDto dto) {
        try {
            BookingResponseDto booking = bookingService.approveOrRejectBooking(id, dto);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * PATCH: Cancel a booking
     */
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<BookingResponseDto> cancelBooking(@PathVariable Long id) {
        try {
            BookingResponseDto booking = bookingService.cancelBooking(id);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
