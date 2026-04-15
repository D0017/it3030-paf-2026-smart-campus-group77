package com.group77.backend.controller;

import com.group77.backend.dto.DashboardSummaryResponseDto;
import com.group77.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponseDto> getDashboardSummary(
            @RequestHeader(value = "X-USER-EMAIL", required = false) String emailHeader
    ) {
        return ResponseEntity.ok(dashboardService.getDashboardSummary(emailHeader));
    }
}