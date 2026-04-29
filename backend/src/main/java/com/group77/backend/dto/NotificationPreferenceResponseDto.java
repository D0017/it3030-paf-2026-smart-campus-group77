package com.group77.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreferenceResponseDto {

    private Long id;
    private boolean bookingNotificationsEnabled;
    private boolean ticketStatusNotificationsEnabled;
    private boolean ticketCommentNotificationsEnabled;
    private boolean adminBroadcastNotificationsEnabled;
}