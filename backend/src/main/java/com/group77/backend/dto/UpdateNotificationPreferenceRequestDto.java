package com.group77.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateNotificationPreferenceRequestDto {

    private boolean bookingNotificationsEnabled;
    private boolean ticketStatusNotificationsEnabled;
    private boolean ticketCommentNotificationsEnabled;
    private boolean adminBroadcastNotificationsEnabled;
}