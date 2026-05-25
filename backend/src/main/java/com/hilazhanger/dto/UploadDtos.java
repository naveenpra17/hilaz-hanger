package com.hilazhanger.dto;

public final class UploadDtos {

    private UploadDtos() {}

    public record ImageUploadResponse(
            String url,
            String publicId,
            int width,
            int height
    ) {}
}
