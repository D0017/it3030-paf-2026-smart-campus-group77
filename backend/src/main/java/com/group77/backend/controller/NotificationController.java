package com.group77.backend.controller;

import com.group77.backend.dto.BroadcastNotificationRequestDto;
import com.group77.backend.dto.NotificationResponseDto;
import com.group77.backend.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationResponseDto>> getMyNotifications(
            @RequestHeader(value = "X-USER-EMAIL", required = false) String emailHeader
    ) {
        return ResponseEntity.ok(notificationService.getMyNotifications(emailHeader));
    }

    @PatchMapping("/notifications/{id}/read")
    public ResponseEntity<NotificationResponseDto> markNotificationAsRead(
            @PathVariable Long id,
            @RequestHeader(value = "X-USER-EMAIL", required = false) String emailHeader
    ) {
        return ResponseEntity.ok(notificationService.markAsRead(id, emailHeader));
    }

    @DeleteMapping("/notifications/{id}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long id,
            @RequestHeader(value = "X-USER-EMAIL", required = false) String emailHeader
    ) {
        notificationService.deleteNotification(id, emailHeader);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/admin/notifications/broadcast")
    public ResponseEntity<Void> broadcastNotification(
            @Valid @RequestBody BroadcastNotificationRequestDto request,
            @RequestHeader(value = "X-USER-EMAIL", required = false) String emailHeader
    ) {
        notificationService.broadcastNotification(request, emailHeader);
        return ResponseEntity.ok().build();
    }
}