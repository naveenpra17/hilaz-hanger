package com.hilazhanger.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.hilazhanger.dto.UploadDtos;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;
    private final boolean enabled;

    public CloudinaryService(
            @Value("${app.cloudinary.cloud-name:}") String cloudName,
            @Value("${app.cloudinary.api-key:}") String apiKey,
            @Value("${app.cloudinary.api-secret:}") String apiSecret
    ) {
        this.enabled = cloudName != null && !cloudName.isBlank()
                && apiKey != null && !apiKey.isBlank()
                && apiSecret != null && !apiSecret.isBlank();
        if (enabled) {
            this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret,
                    "secure", true
            ));
        } else {
            this.cloudinary = null;
        }
    }

    public boolean isEnabled() {
        return enabled;
    }

    public UploadDtos.ImageUploadResponse upload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty");
        }
        if (!enabled) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET"
            );
        }
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "hilaz-hanger/products",
                            "resource_type", "image"
                    )
            );
            return new UploadDtos.ImageUploadResponse(
                    (String) result.get("secure_url"),
                    (String) result.get("public_id"),
                    ((Number) result.getOrDefault("width", 0)).intValue(),
                    ((Number) result.getOrDefault("height", 0)).intValue()
            );
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Upload failed");
        }
    }
}
