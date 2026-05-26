package com.hilazhanger.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public final class MiscDtos {

    private MiscDtos() {}

    public record ContactRequest(
            @NotBlank String name,
            @Email @NotBlank String email,
            @NotBlank String message
    ) {}

    public record ContactResponse(String message) {}

    public record NewsletterRequest(@Email @NotBlank String email) {}

    public record NewsletterResponse(String message) {}

    public record ShippingQuoteResponse(BigDecimal shippingPrice, String description) {}

    public record StoreConfigResponse(
            String storeName,
            String phone,
            String email,
            String whatsappNumber,
            String whatsappMessage,
            String instagramUrl,
            String address
    ) {}
}
