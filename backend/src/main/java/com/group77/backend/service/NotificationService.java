package com.group77.backend.service;

import com.group77.backend.dto.BroadcastNotificationRequestDto;
import com.group77.backend.dto.NotificationResponseDto;
import com.group77.backend.entity.Notification;
import com.group77.backend.entity.NotificationPreference;
import com.group77.backend.entity.User;
import com.group77.backend.enums.NotificationType;
import com.group77.backend.exception.ForbiddenActionException;
import com.group77.backend.exception.ResourceNotFoundException;
import com.group77.backend.repository.NotificationPreferenceRepository;
import com.group77.backend.repository.NotificationRepository;
import com.group77.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final NotificationPreferenceRepository notificationPreferenceRepository;

    public List<NotificationResponseDto> getMyNotifications(Authentication authentication, String emailHeader) {
        User currentUser = currentUserService.resolveCurrentUser(authentication, emailHeader);

        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    public NotificationResponseDto markAsRead(Long notificationId, Authentication authentication, String emailHeader) {
        User currentUser = currentUserService.resolveCurrentUser(authentication, emailHeader);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getRecipient().getId().equals(currentUser.getId())) {
            throw new ForbiddenActionException("You cannot update another user's notification");
        }

        notification.setRead(true);
        return mapToDto(notificationRepository.save(notification));
    }

    public void deleteNotification(Long notificationId, Authentication authentication, String emailHeader) {
        User currentUser = currentUserService.resolveCurrentUser(authentication, emailHeader);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getRecipient().getId().equals(currentUser.getId())) {
            throw new ForbiddenActionException("You cannot delete another user's notification");
        }

        notificationRepository.delete(notification);
    }

    public void broadcastNotification(
            BroadcastNotificationRequestDto request,
            Authentication authentication,
            String emailHeader
    ) {
        currentUserService.resolveCurrentAdmin(authentication, emailHeader);

        List<User> recipients = (request.getRecipientRole() == null)
                ? userRepository.findAll()
                : userRepository.findByRole(request.getRecipientRole());

        for (User user : recipients) {
            createNotification(
                    user,
                    request.getTitle(),
                    request.getMessage(),
                    NotificationType.ADMIN_BROADCAST
            );
        }
    }

    public Notification createNotification(User recipient, String title, String message, NotificationType type) {
        if (!isNotificationEnabledForUser(recipient, type)) {
            return null;
        }

        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .type(type)
                .recipient(recipient)
                .build();

        return notificationRepository.save(notification);
    }

    private boolean isNotificationEnabledForUser(User recipient, NotificationType type) {
        NotificationPreference preference = notificationPreferenceRepository.findByUserId(recipient.getId())
                .orElse(null);

        if (preference == null) {
            return true;
        }

        return switch (type) {
            case BOOKING_APPROVED, BOOKING_REJECTED -> preference.isBookingNotificationsEnabled();
            case TICKET_STATUS_CHANGED -> preference.isTicketStatusNotificationsEnabled();
            case NEW_TICKET_COMMENT -> preference.isTicketCommentNotificationsEnabled();
            case ADMIN_BROADCAST -> preference.isAdminBroadcastNotificationsEnabled();
        };
    }

    private NotificationResponseDto mapToDto(Notification notification) {
        return NotificationResponseDto.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}