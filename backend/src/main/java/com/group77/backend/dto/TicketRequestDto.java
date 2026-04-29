package com.group77.backend.dto;

import com.group77.backend.enums.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TicketRequestDto {

    @NotBlank
    private String studentName;

    @NotBlank
    private String studentEmail;

    @NotBlank
    private String contactNumber;

    @NotBlank
    private String subject;

    @NotBlank
    private String message;

    @NotNull
    private TicketPriority priority;
}