package com.group77.backend.dto;

import com.group77.backend.enums.BookingStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingQrValidationResponseDto {
    private boolean valid;
    private String message;
    private Long bookingId;
    private String assetName;
    private String userName;
    private BookingStatus status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime validatedAt;
}
