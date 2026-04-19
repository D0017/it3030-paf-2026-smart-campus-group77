package com.group77.backend.dto;

import com.group77.backend.enums.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TicketRequestDto {

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotBlank
    private String category;

    @NotBlank
    private String location;

    @NotBlank
    private String preferredContactDetails;

    @NotNull
    private TicketPriority priority;
}