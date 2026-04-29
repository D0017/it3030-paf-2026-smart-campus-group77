package com.group77.backend.controller;

import com.group77.backend.dto.BroadcastNotificationRequestDto;
import com.group77.backend.dto.NotificationResponseDto;
import com.group77.backend.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationResponseDto>> getMyNotifications(
            Authentication authentication,
            @RequestHeader(value = "X-USER-EMAIL", required = false) String emailHeader
    ) {
        return ResponseEntity.ok(notificationService.getMyNotifications(authentication, emailHeader));
    }

    @PatchMapping("/notifications/{id}/read")
    public ResponseEntity<NotificationResponseDto> markNotificationAsRead(
            @PathVariable Long id,
            Authentication authentication,
            @RequestHeader(value = "X-USER-EMAIL", required = false) String emailHeader
    ) {
        return ResponseEntity.ok(notificationService.markAsRead(id, authentication, emailHeader));
    }

    @DeleteMapping("/notifications/{id}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long id,
            Authentication authentication,
            @RequestHeader(value = "X-USER-EMAIL", required = false) String emailHeader
    ) {
        notificationService.deleteNotification(id, authentication, emailHeader);
        return ResponseEntity.noContent().build();  
    }

    @PostMapping("/admin/notifications/broadcast")
    public ResponseEntity<Void> broadcastNotification(
            @Valid @RequestBody BroadcastNotificationRequestDto request,
            Authentication authentication,
            @RequestHeader(value = "X-USER-EMAIL", required = false) String emailHeader
    ) {
        notificationService.broadcastNotification(request, authentication, emailHeader);
        return ResponseEntity.ok().build();
    }
}