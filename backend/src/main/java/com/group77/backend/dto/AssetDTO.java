package com.group77.backend.dto;

import com.group77.backend.enums.AssetStatus;
import com.group77.backend.enums.AssetType;
import lombok.Data;

@Data
public class AssetDTO {
    private Long id;
    private String name;
    private AssetType type;
    private int capacity;
    private String location;
    private String availabilityWindows;
    private AssetStatus status;
}