package com.group77.backend.controller;

import com.group77.backend.dto.AuthUserResponseDto;
import com.group77.backend.entity.User;
import com.group77.backend.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final CurrentUserService currentUserService;

    @GetMapping("/me")
    public ResponseEntity<AuthUserResponseDto> getCurrentUser(
            Authentication authentication,
            @RequestHeader(value = "X-USER-EMAIL", required = false) String emailHeader
    ) {
        User user = currentUserService.resolveCurrentUser(authentication, emailHeader);

        AuthUserResponseDto response = AuthUserResponseDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .active(user.getActive())
                .build();

        return ResponseEntity.ok(response);
    }
}