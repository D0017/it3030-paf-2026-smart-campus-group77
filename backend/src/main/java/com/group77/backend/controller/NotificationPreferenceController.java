package com.group77.backend.controller;

import com.group77.backend.dto.NotificationPreferenceResponseDto;
import com.group77.backend.dto.UpdateNotificationPreferenceRequestDto;
import com.group77.backend.service.NotificationPreferenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications/preferences")
public class NotificationPreferenceController {

    private final NotificationPreferenceService notificationPreferenceService;

    @GetMapping
    public ResponseEntity<NotificationPreferenceResponseDto> getMyPreferences(
            Authentication authentication,
            @RequestHeader(value = "X-USER-EMAIL", required = false) String emailHeader
    ) {
        return ResponseEntity.ok(notificationPreferenceService.getMyPreferences(authentication, emailHeader));
    }

    @PutMapping
    public ResponseEntity<NotificationPreferenceResponseDto> updateMyPreferences(
            @RequestBody UpdateNotificationPreferenceRequestDto request,
            Authentication authentication,
            @RequestHeader(value = "X-USER-EMAIL", required = false) String emailHeader
    ) {
        return ResponseEntity.ok(notificationPreferenceService.updateMyPreferences(request, authentication, emailHeader));
    }
}