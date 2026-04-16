package com.group77.backend.service;

import com.group77.backend.dto.AdminUserResponseDto;
import com.group77.backend.dto.UpdateUserRoleRequestDto;
import com.group77.backend.entity.User;
import com.group77.backend.exception.ForbiddenActionException;
import com.group77.backend.exception.ResourceNotFoundException;
import com.group77.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminUserService {

    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    public List<AdminUserResponseDto> getAllUsers(Authentication authentication, String emailHeader) {
        currentUserService.resolveCurrentAdmin(authentication, emailHeader);

        return userRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(User::getId))
                .map(this::mapToDto)
                .toList();
    }

    public AdminUserResponseDto updateUserRole(
            Long userId,
            UpdateUserRoleRequestDto request,
            Authentication authentication,
            String emailHeader
    ) {
        User currentAdmin = currentUserService.resolveCurrentAdmin(authentication, emailHeader);

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (currentAdmin.getId().equals(targetUser.getId()) && request.getRole() != targetUser.getRole()) {
            throw new ForbiddenActionException("You cannot change your own role");
        }

        targetUser.setRole(request.getRole());
        User savedUser = userRepository.save(targetUser);

        return mapToDto(savedUser);
    }

    private AdminUserResponseDto mapToDto(User user) {
        return AdminUserResponseDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .active(user.getActive())
                .build();
    }
}