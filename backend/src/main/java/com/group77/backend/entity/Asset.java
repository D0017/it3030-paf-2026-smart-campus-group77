package com.group77.backend.entity;

import com.group77.backend.enums.AssetStatus;
import com.group77.backend.enums.AssetType;
import com.fasterxml.jackson.annotation.JsonProperty;
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
    private AssetType type; 

    private int capacity; 
    private String location; 

    @JsonProperty("availability_windows") // ඉතා වැදගත්!
    @Column(name = "availability_windows") 
    private String availabilityWindows; 

    @Enumerated(EnumType.STRING)
    private AssetStatus status; 
}