package com.group77.backend.entity;

import com.group77.backend.enums.AssetStatus;
import com.group77.backend.enums.AssetType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Asset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    private AssetType type; // LECTURE_HALL, etc. [cite: 25, 26]

    private int capacity; // [cite: 25, 26]
    private String location; // [cite: 25, 26]
    private String availabilityWindows; // 

    @Enumerated(EnumType.STRING)
    private AssetStatus status; // ACTIVE, OUT_OF_SERVICE 
}