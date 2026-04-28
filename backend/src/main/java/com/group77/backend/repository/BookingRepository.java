package com.group77.backend.repository;

import com.group77.backend.entity.Booking;
import com.group77.backend.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByAssetId(Long assetId);

    List<Booking> findByStatus(BookingStatus status);

    Optional<Booking> findByQrToken(String qrToken);

    // Check for overlapping bookings on the same asset
    @Query("SELECT b FROM Booking b WHERE b.asset.id = :assetId " +
           "AND b.status IN ('PENDING', 'APPROVED') " +
           "AND ((b.startTime < :endTime AND b.endTime > :startTime))")
    List<Booking> findConflictingBookings(
            @Param("assetId") Long assetId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    @Query("SELECT b FROM Booking b WHERE b.asset.id = :assetId " +
           "AND b.id <> :bookingId " +
           "AND b.status IN ('PENDING', 'APPROVED') " +
           "AND ((b.startTime < :endTime AND b.endTime > :startTime))")
    List<Booking> findConflictingBookingsExcludingBooking(
            @Param("assetId") Long assetId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("bookingId") Long bookingId
    );
}
