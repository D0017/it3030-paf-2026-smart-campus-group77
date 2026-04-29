package com.group77.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingApprovalDto {
    private Boolean approved;
    private String rejectionReason;
}
