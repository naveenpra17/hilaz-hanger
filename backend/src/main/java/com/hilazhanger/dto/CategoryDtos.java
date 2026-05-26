package com.hilazhanger.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public final class CategoryDtos {

    private CategoryDtos() {}

    public record CategoryDto(
            UUID id,
            String name,
            String slug,
            String description,
            String imageUrl,
            int sortOrder,
            boolean active
    ) {}

    public record CategoryRequest(
            @NotBlank String name,
            @NotBlank String slug,
            String description,
            String imageUrl,
            int sortOrder,
            boolean active
    ) {}
}
