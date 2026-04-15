package com.group77.backend.service;

import com.group77.backend.dto.DashboardSummaryResponseDto;
import com.group77.backend.entity.User;
import com.group77.backend.enums.RoleName;
import com.group77.backend.repository.NotificationRepository;
import com.group77.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final CurrentUserService currentUserService;

    public DashboardSummaryResponseDto getDashboardSummary(String emailHeader) {
        User admin = currentUserService.getCurrentAdmin(emailHeader);

        return DashboardSummaryResponseDto.builder()
                .totalUsers(userRepository.count())
                .totalAdmins(userRepository.countByRole(RoleName.ADMIN))
                .totalRegularUsers(userRepository.countByRole(RoleName.USER))
                .totalTechnicians(userRepository.countByRole(RoleName.TECHNICIAN))
                .myNotifications(notificationRepository.countByRecipientId(admin.getId()))
                .myUnreadNotifications(notificationRepository.countByRecipientIdAndReadFalse(admin.getId()))
                .build();
    }
}