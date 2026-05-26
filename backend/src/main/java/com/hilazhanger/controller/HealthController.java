package com.hilazhanger.controller;

import com.hilazhanger.service.CloudinaryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class HealthController {

    private final CloudinaryService cloudinaryService;

    public HealthController(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", "ok");
        body.put("app", "Hilaz Hanger API");
        body.put("cloudinaryConfigured", cloudinaryService.isEnabled());
        return body;
    }
}
