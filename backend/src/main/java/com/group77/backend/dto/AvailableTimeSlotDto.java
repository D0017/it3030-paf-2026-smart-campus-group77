package com.group77.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailableTimeSlotDto {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String label;
}
