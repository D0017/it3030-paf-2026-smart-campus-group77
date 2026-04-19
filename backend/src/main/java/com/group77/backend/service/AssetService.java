package com.group77.backend.service;

import com.group77.backend.entity.Asset;
import com.group77.backend.repository.AssetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AssetService {
    
    @Autowired
    private AssetRepository assetRepository;

    
    public Asset saveAsset(Asset asset) { 
        return assetRepository.save(asset); 
    }

    
    public List<Asset> getAllAssets() { 
        return assetRepository.findAll(); 
    }

    
    public Asset updateAsset(Long id, Asset assetDetails) {
        
        Asset asset = assetRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Asset not found with id: " + id));
        
        asset.setName(assetDetails.getName());
        asset.setType(assetDetails.getType());
        asset.setCapacity(assetDetails.getCapacity());
        asset.setLocation(assetDetails.getLocation());
        asset.setAvailabilityWindows(assetDetails.getAvailabilityWindows()); // අලුතින් එකතු කළා
        asset.setStatus(assetDetails.getStatus());
        
        return assetRepository.save(asset);
    }


    public void deleteAsset(Long id) { 
        assetRepository.deleteById(id); 
    }
}