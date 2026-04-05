package com.group77.backend.config;

import com.group77.backend.entity.User;
import com.group77.backend.enums.RoleName;
import com.group77.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        seedUser("Admin User", "admin@campusops.com", RoleName.ADMIN);
        seedUser("Normal User", "user@campusops.com", RoleName.USER);
        seedUser("Tech User", "tech@campusops.com", RoleName.TECHNICIAN);
    }

    private void seedUser(String fullName, String email, RoleName role) {
        if (!userRepository.existsByEmail(email)) {
            User user = User.builder()
                    .fullName(fullName)
                    .email(email)
                    .role(role)
                    .active(true)
                    .build();

            userRepository.save(user);
        }
    }
}