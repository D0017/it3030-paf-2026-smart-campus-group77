package com.group77.backend.controller;

import com.group77.backend.dto.AdminUserResponseDto;
import com.group77.backend.dto.UpdateUserRoleRequestDto;
import com.group77.backend.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<List<AdminUserResponseDto>> getAllUsers(
            Authentication authentication,
            @RequestHeader(value = "X-USER-EMAIL", required = false) String emailHeader
    ) {
        return ResponseEntity.ok(adminUserService.getAllUsers(authentication, emailHeader));
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<AdminUserResponseDto> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRoleRequestDto request,
            Authentication authentication,
            @RequestHeader(value = "X-USER-EMAIL", required = false) String emailHeader
    ) {
        return ResponseEntity.ok(adminUserService.updateUserRole(id, request, authentication, emailHeader));
    }
}