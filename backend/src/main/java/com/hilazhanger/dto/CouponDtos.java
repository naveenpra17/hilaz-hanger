package com.hilazhanger.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public final class CouponDtos {

    private CouponDtos() {}

    public record CouponDto(
            UUID id,
            String code,
            String discountType,
            BigDecimal discountValue,
            BigDecimal minOrderAmount,
            Integer maxUses,
            int usedCount,
            boolean active,
            Instant expiresAt
    ) {}

    public record CreateCouponRequest(
            @NotBlank String code,
            @NotBlank String discountType,
            @NotNull BigDecimal discountValue,
            BigDecimal minOrderAmount,
            Integer maxUses,
            boolean active,
            Instant expiresAt
    ) {}

    public record UpdateCouponRequest(
            @NotBlank String discountType,
            @NotNull BigDecimal discountValue,
            BigDecimal minOrderAmount,
            Integer maxUses,
            boolean active,
            Instant expiresAt
    ) {}

    public record ValidateCouponRequest(
            @NotBlank String code,
            @NotNull BigDecimal subtotal
    ) {}

    public record ValidateCouponResponse(
            boolean valid,
            String message,
            BigDecimal discountAmount,
            String discountType,
            BigDecimal discountValue
    ) {}
}
