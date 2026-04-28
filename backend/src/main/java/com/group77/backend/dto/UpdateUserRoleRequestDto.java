package com.group77.backend.dto;

import com.group77.backend.enums.RoleName;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserRoleRequestDto {

    @NotNull(message = "Role is required")
    private RoleName role;
}