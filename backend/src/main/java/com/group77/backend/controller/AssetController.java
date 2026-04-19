package com.group77.backend.controller;

import com.group77.backend.entity.Asset;
import com.group77.backend.service.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
@CrossOrigin(origins = "*") 
public class AssetController {

    @Autowired
    private AssetService assetService;


    @PostMapping
    public ResponseEntity<Asset> createAsset(@RequestBody Asset asset) {
        System.out.println("DEBUG: Creating Asset: " + asset.getName());
        Asset savedAsset = assetService.saveAsset(asset);        
        return new ResponseEntity<>(savedAsset, HttpStatus.CREATED);
    }


    @GetMapping
    public ResponseEntity<List<Asset>> getAllAssets() {
        return ResponseEntity.ok(assetService.getAllAssets());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Asset> updateAsset(@PathVariable Long id, @RequestBody Asset asset) {
        Asset updatedAsset = assetService.updateAsset(id, asset);
        return ResponseEntity.ok(updatedAsset);
    }

    
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAsset(@PathVariable Long id) {
        assetService.deleteAsset(id);
        return ResponseEntity.ok("Asset deleted successfully");
    }
}