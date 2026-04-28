package com.group77.backend.service;

import com.group77.backend.entity.User;
import com.group77.backend.enums.RoleName;
import com.group77.backend.exception.ForbiddenActionException;
import com.group77.backend.exception.ResourceNotFoundException;
import com.group77.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserRepository userRepository;

    public User resolveCurrentUser(Authentication authentication, String emailHeader) {
        String email = extractEmail(authentication, emailHeader);

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for email: " + email));
    }

    public User resolveCurrentAdmin(Authentication authentication, String emailHeader) {
        User user = resolveCurrentUser(authentication, emailHeader);

        if (user.getRole() != RoleName.ADMIN) {
            throw new ForbiddenActionException("Only admins can perform this action");
        }

        return user;
    }

    private String extractEmail(Authentication authentication, String emailHeader) {
        if (authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken)) {

            Object principal = authentication.getPrincipal();

            if (principal instanceof OAuth2User oauth2User) {
                String email = oauth2User.getAttribute("email");
                if (email != null && !email.isBlank()) {
                    return email;
                }
            }

            String authName = authentication.getName();
            if (authName != null && !authName.isBlank() && !"anonymousUser".equals(authName)) {
                return authName;
            }
        }

        return (emailHeader != null && !emailHeader.isBlank())
                ? emailHeader
                : "admin@campusops.com";
    }
}