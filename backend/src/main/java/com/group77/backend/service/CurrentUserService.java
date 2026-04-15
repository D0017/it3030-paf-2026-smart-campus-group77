package com.group77.backend.service;

import com.group77.backend.entity.User;
import com.group77.backend.enums.RoleName;
import com.group77.backend.exception.ForbiddenActionException;
import com.group77.backend.exception.ResourceNotFoundException;
import com.group77.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserRepository userRepository;

    public User getCurrentUser(String emailHeader) {
        String email = (emailHeader != null && !emailHeader.isBlank())
                ? emailHeader
                : "admin@campusops.com";

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for email: " + email));
    }

    public User getCurrentAdmin(String emailHeader) {
        User user = getCurrentUser(emailHeader);

        if (user.getRole() != RoleName.ADMIN) {
            throw new ForbiddenActionException("Only admins can perform this action");
        }

        return user;
    }
}