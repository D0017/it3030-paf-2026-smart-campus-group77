package com.group77.backend.dto;

import com.group77.backend.enums.RoleName;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserResponseDto {
    private Long id;
    private String fullName;
    private String email;
    private RoleName role;
    private Boolean active;
}