package com.hilazhanger.dto;

import com.hilazhanger.domain.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public final class AuthDtos {

    private AuthDtos() {}

    public record LoginRequest(
            @Email @NotBlank String email,
            @NotBlank String password
    ) {}

    public record RegisterRequest(
            @Email @NotBlank String email,
            @NotBlank @Size(min = 6) String password,
            @NotBlank String fullName,
            String phone
    ) {}

    public record UserDto(UUID id, String email, String fullName, String phone, UserRole role) {}

    public record AuthResponse(String token, UserDto user) {}
}
