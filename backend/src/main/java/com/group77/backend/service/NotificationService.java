package com.group77.backend.service;

import com.group77.backend.dto.BroadcastNotificationRequestDto;
import com.group77.backend.dto.NotificationResponseDto;
import com.group77.backend.entity.Notification;
import com.group77.backend.entity.User;
import com.group77.backend.enums.NotificationType;
import com.group77.backend.repository.NotificationRepository;
import com.group77.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
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

    public List<NotificationResponseDto> getMyNotifications(String emailHeader) {
        User currentUser = currentUserService.getCurrentUser(emailHeader);

        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    public NotificationResponseDto markAsRead(Long notificationId, String emailHeader) {
        User currentUser = currentUserService.getCurrentUser(emailHeader);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

        if (!notification.getRecipient().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You cannot update another user's notification");
        }

        notification.setRead(true);
        return mapToDto(notificationRepository.save(notification));
    }

    public void deleteNotification(Long notificationId, String emailHeader) {
        User currentUser = currentUserService.getCurrentUser(emailHeader);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

        if (!notification.getRecipient().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You cannot delete another user's notification");
        }

        notificationRepository.delete(notification);
    }

    public void broadcastNotification(BroadcastNotificationRequestDto request, String emailHeader) {
        currentUserService.getCurrentAdmin(emailHeader);

        List<User> recipients = (request.getRecipientRole() == null)
                ? userRepository.findAll()
                : userRepository.findByRole(request.getRecipientRole());

        for (User user : recipients) {
            Notification notification = Notification.builder()
                    .title(request.getTitle())
                    .message(request.getMessage())
                    .type(NotificationType.ADMIN_BROADCAST)
                    .recipient(user)
                    .build();

            notificationRepository.save(notification);
        }
    }

    public Notification createNotification(User recipient, String title, String message, NotificationType type) {
        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .type(type)
                .recipient(recipient)
                .build();

        return notificationRepository.save(notification);
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