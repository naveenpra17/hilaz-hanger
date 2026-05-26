package com.hilazhanger.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public final class AddressDtos {

    private AddressDtos() {}

    public record AddressDto(
            UUID id,
            String label,
            String fullName,
            String phone,
            String streetLine,
            String city,
            String pincode,
            boolean defaultAddress
    ) {}

    public record AddressRequest(
            @NotBlank @Size(max = 80) String label,
            @NotBlank String fullName,
            @NotBlank String phone,
            @NotBlank String streetLine,
            @NotBlank String city,
            @NotBlank String pincode,
            boolean defaultAddress
    ) {}
}
