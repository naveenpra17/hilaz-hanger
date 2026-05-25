package com.hilazhanger.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public final class ProductDtos {

    private ProductDtos() {}

    public record ProductImageDto(UUID id, String url, String publicId, int sortOrder, boolean isPrimary) {
        public ProductImageDto(UUID id, String url, int sortOrder, boolean isPrimary) {
            this(id, url, null, sortOrder, isPrimary);
        }
    }

    public record ProductVariantDto(UUID id, String colorName, String colorHex, String size, int stockQuantity) {}

    public record ProductDto(
            UUID id,
            String name,
            String brand,
            String slug,
            String description,
            String fabric,
            String colorInfo,
            BigDecimal price,
            BigDecimal compareAtPrice,
            boolean active,
            boolean expressShipping,
            List<String> labels,
            List<String> sizes,
            String colors,
            List<ProductImageDto> images,
            List<ProductVariantDto> variants,
            Integer totalStock
    ) {}

    public record ProductPageDto(
            List<ProductDto> content,
            long totalElements,
            int totalPages,
            int number,
            int size
    ) {}

    public record CreateProductRequest(
            String name,
            String brand,
            String slug,
            String description,
            String fabric,
            String colorInfo,
            BigDecimal price,
            BigDecimal compareAtPrice,
            boolean active,
            boolean expressShipping,
            List<String> labels,
            List<String> sizes,
            List<ProductImageDto> images
    ) {}

    public record UpdateProductRequest(
            String name,
            String brand,
            String slug,
            String description,
            String fabric,
            String colorInfo,
            BigDecimal price,
            BigDecimal compareAtPrice,
            boolean active,
            boolean expressShipping,
            List<String> labels,
            List<String> sizes,
            List<ProductImageDto> images
    ) {}
}
