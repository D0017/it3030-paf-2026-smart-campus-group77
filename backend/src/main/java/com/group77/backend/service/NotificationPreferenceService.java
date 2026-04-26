package com.group77.backend.service;

import com.group77.backend.dto.NotificationPreferenceResponseDto;
import com.group77.backend.dto.UpdateNotificationPreferenceRequestDto;
import com.group77.backend.entity.NotificationPreference;
import com.group77.backend.entity.User;
import com.group77.backend.repository.NotificationPreferenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationPreferenceService {

    private final NotificationPreferenceRepository notificationPreferenceRepository;
    private final CurrentUserService currentUserService;

    public NotificationPreferenceResponseDto getMyPreferences(
            Authentication authentication,
            String emailHeader
    ) {
        User currentUser = currentUserService.resolveCurrentUser(authentication, emailHeader);
        NotificationPreference preference = getOrCreatePreference(currentUser);

        return mapToDto(preference);
    }

    public NotificationPreferenceResponseDto updateMyPreferences(
            UpdateNotificationPreferenceRequestDto request,
            Authentication authentication,
            String emailHeader
    ) {
        User currentUser = currentUserService.resolveCurrentUser(authentication, emailHeader);
        NotificationPreference preference = getOrCreatePreference(currentUser);

        preference.setBookingNotificationsEnabled(request.isBookingNotificationsEnabled());
        preference.setTicketStatusNotificationsEnabled(request.isTicketStatusNotificationsEnabled());
        preference.setTicketCommentNotificationsEnabled(request.isTicketCommentNotificationsEnabled());
        preference.setAdminBroadcastNotificationsEnabled(request.isAdminBroadcastNotificationsEnabled());

        NotificationPreference savedPreference = notificationPreferenceRepository.save(preference);

        return mapToDto(savedPreference);
    }

    private NotificationPreference getOrCreatePreference(User user) {
        return notificationPreferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> notificationPreferenceRepository.save(
                        NotificationPreference.builder()
                                .user(user)
                                .bookingNotificationsEnabled(true)
                                .ticketStatusNotificationsEnabled(true)
                                .ticketCommentNotificationsEnabled(true)
                                .adminBroadcastNotificationsEnabled(true)
                                .build()
                ));
    }

    private NotificationPreferenceResponseDto mapToDto(NotificationPreference preference) {
        return NotificationPreferenceResponseDto.builder()
                .id(preference.getId())
                .bookingNotificationsEnabled(preference.isBookingNotificationsEnabled())
                .ticketStatusNotificationsEnabled(preference.isTicketStatusNotificationsEnabled())
                .ticketCommentNotificationsEnabled(preference.isTicketCommentNotificationsEnabled())
                .adminBroadcastNotificationsEnabled(preference.isAdminBroadcastNotificationsEnabled())
                .build();
    }
}