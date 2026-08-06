package com.hilazhanger.controller;

import com.hilazhanger.repository.UserRepository;
import com.hilazhanger.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class HealthController {

    private final CloudinaryService cloudinaryService;
    private final UserRepository userRepository;
    private final String adminSeedEmail;
    private final String adminSeedPassword;

    public HealthController(
            CloudinaryService cloudinaryService,
            UserRepository userRepository,
            @Value("${app.seed.admin-email:}") String adminSeedEmail,
            @Value("${app.seed.admin-password:}") String adminSeedPassword
    ) {
        this.cloudinaryService = cloudinaryService;
        this.userRepository = userRepository;
        this.adminSeedEmail = adminSeedEmail;
        this.adminSeedPassword = adminSeedPassword;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", "ok");
        body.put("app", "Hilaz Hanger API");
        body.put("cloudinaryConfigured", cloudinaryService.isEnabled());
        body.put("userCount", userRepository.count());
        body.put("adminSeedEmailConfigured", adminSeedEmail != null && !adminSeedEmail.isBlank());
        body.put("adminSeedPasswordConfigured", adminSeedPassword != null && !adminSeedPassword.isBlank());
        if (adminSeedEmail != null && !adminSeedEmail.isBlank()) {
            body.put("adminUserExists", userRepository.findByEmail(adminSeedEmail.trim().toLowerCase()).isPresent());
        }
        return body;
    }
}
