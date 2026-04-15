package com.group77.backend.service;

import com.group77.backend.entity.User;
import com.group77.backend.enums.RoleName;
import com.group77.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OAuth2UserProvisioningService {

    private final UserRepository userRepository;

    public User findOrCreateUser(String email, String fullName) {
        return userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .email(email)
                            .fullName(fullName != null && !fullName.isBlank() ? fullName : email)
                            .role(RoleName.USER)
                            .active(true)
                            .build();

                    return userRepository.save(newUser);
                });
    }
}