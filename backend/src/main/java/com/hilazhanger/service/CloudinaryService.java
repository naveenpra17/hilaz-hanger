package com.hilazhanger.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.hilazhanger.dto.UploadDtos;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * Uploads via Cloudinary REST API (avoids cloudinary-http44 / Apache HttpClient conflicts on Render).
 */
@Service
public class CloudinaryService {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryService.class);
    private static final String UPLOAD_FOLDER = "hilaz-hanger/products";

    private final RestClient restClient;
    private final String cloudName;
    private final String apiKey;
    private final String apiSecret;
    private final boolean enabled;

    public CloudinaryService(
            @Value("${app.cloudinary.cloud-name:}") String cloudName,
            @Value("${app.cloudinary.api-key:}") String apiKey,
            @Value("${app.cloudinary.api-secret:}") String apiSecret
    ) {
        this.cloudName = trim(cloudName);
        this.apiKey = trim(apiKey);
        this.apiSecret = trim(apiSecret);
        this.enabled = isValidCredential(this.cloudName)
                && isValidCredential(this.apiKey)
                && isValidCredential(this.apiSecret);

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(30_000);
        factory.setReadTimeout(60_000);
        this.restClient = RestClient.builder().requestFactory(factory).build();
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
                    "Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET on Render."
            );
        }

        final String filename;
        String original = file.getOriginalFilename();
        if (original == null || original.isBlank()) {
            filename = "product.jpg";
        } else {
            filename = original;
        }

        try {
            byte[] bytes = file.getBytes();
            long timestamp = Instant.now().getEpochSecond();

            Map<String, String> signParams = new TreeMap<>();
            signParams.put("folder", UPLOAD_FOLDER);
            signParams.put("timestamp", String.valueOf(timestamp));
            String signature = sign(signParams);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(bytes) {
                @Override
                public String getFilename() {
                    return filename;
                }
            });
            body.add("api_key", apiKey);
            body.add("timestamp", String.valueOf(timestamp));
            body.add("signature", signature);
            body.add("folder", UPLOAD_FOLDER);

            String url = "https://api.cloudinary.com/v1_1/" + cloudName + "/image/upload";

            CloudinaryUploadResponse response = restClient.post()
                    .uri(url)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(CloudinaryUploadResponse.class);

            if (response == null || response.secureUrl == null || response.secureUrl.isBlank()) {
                log.error("Cloudinary returned empty response for {}", filename);
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Cloudinary returned no image URL");
            }

            return new UploadDtos.ImageUploadResponse(
                    response.secureUrl,
                    response.publicId,
                    response.width != null ? response.width : 0,
                    response.height != null ? response.height : 0
            );
        } catch (RestClientResponseException e) {
            String detail = e.getResponseBodyAsString();
            log.error("Cloudinary HTTP {}: {}", e.getStatusCode().value(), detail);
            String message = parseCloudinaryError(detail);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, message);
        } catch (IOException e) {
            log.error("Failed to read upload file", e);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not read uploaded file");
        } catch (Exception e) {
            log.error("Cloudinary upload failed", e);
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Image upload failed: " + (e.getMessage() != null ? e.getMessage() : "unknown error")
            );
        }
    }

    private String sign(Map<String, String> params) {
        String payload = params.entrySet().stream()
                .map(e -> e.getKey() + "=" + e.getValue())
                .collect(Collectors.joining("&"));
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-1");
            byte[] hash = digest.digest((payload + apiSecret).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    private String parseCloudinaryError(String body) {
        if (body == null || body.isBlank()) {
            return "Cloudinary upload failed. Check API credentials on Render.";
        }
        if (body.contains("Invalid Signature")) {
            return "Cloudinary API secret is wrong (Invalid Signature). Copy the secret again from the Cloudinary dashboard.";
        }
        if (body.contains("Invalid api_key")) {
            return "Cloudinary API key is invalid. Check CLOUDINARY_API_KEY on Render.";
        }
        if (body.contains("cloud_name")) {
            return "Cloudinary cloud name is invalid. Check CLOUDINARY_CLOUD_NAME on Render.";
        }
        if (body.length() > 200) {
            return "Cloudinary upload failed: " + body.substring(0, 200);
        }
        return "Cloudinary upload failed: " + body;
    }

    private static String trim(String value) {
        return value != null ? value.trim() : "";
    }

    private static boolean isValidCredential(String value) {
        if (value.isBlank()) {
            return false;
        }
        String lower = value.toLowerCase();
        return !lower.contains("your_") && !lower.contains("placeholder") && !lower.contains("xxxxx");
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class CloudinaryUploadResponse {
        @JsonProperty("secure_url")
        String secureUrl;
        @JsonProperty("public_id")
        String publicId;
        Integer width;
        Integer height;
    }
}
