package com.hilazhanger.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public final class ReviewDtos {

    private ReviewDtos() {}

    public record ReviewDto(
            UUID id,
            UUID productId,
            UUID userId,
            String authorName,
            int rating,
            String title,
            String body,
            Instant createdAt
    ) {}

    public record CreateReviewRequest(
            @NotNull @Min(1) @Max(5) Integer rating,
            String title,
            String body
    ) {}
}
