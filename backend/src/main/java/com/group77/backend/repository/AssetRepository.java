package com.group77.backend.repository;

import com.group77.backend.entity.Asset;
import com.group77.backend.enums.AssetType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AssetRepository extends JpaRepository<Asset, Long> {
    
    List<Asset> findByType(AssetType type);
    List<Asset> findByLocationContainingIgnoreCase(String location);
}