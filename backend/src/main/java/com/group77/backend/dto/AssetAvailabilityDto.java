package com.group77.backend.dto;

import com.group77.backend.enums.AssetStatus;
import com.group77.backend.enums.AssetType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetAvailabilityDto {
    private Long assetId;
    private String assetName;
    private AssetType assetType;
    private String location;
    private int capacity;
    private AssetStatus status;
    private String availabilityWindows;
    private boolean available;
    private String message;
    private List<AvailableTimeSlotDto> suggestedTimeSlots;
}
