package com.group77.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryResponseDto {
    private long totalUsers;
    private long totalAdmins;
    private long totalRegularUsers;
    private long totalTechnicians;
    private long myNotifications;
    private long myUnreadNotifications;
}