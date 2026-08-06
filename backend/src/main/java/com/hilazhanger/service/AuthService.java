package com.hilazhanger.service;

import com.hilazhanger.domain.entity.PasswordResetToken;
import com.hilazhanger.domain.entity.User;
import com.hilazhanger.domain.enums.UserRole;
import com.hilazhanger.dto.AuthDtos;
import com.hilazhanger.repository.PasswordResetTokenRepository;
import com.hilazhanger.repository.UserRepository;
import com.hilazhanger.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final NotificationService notificationService;
    private final String frontendUrl;

    public AuthService(
            UserRepository userRepository,
            PasswordResetTokenRepository resetTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            NotificationService notificationService,
            @Value("${app.frontend.url:https://hilaz-hanger.vercel.app}") String frontendUrl
    ) {
        this.userRepository = userRepository;
        this.resetTokenRepository = resetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.notificationService = notificationService;
        this.frontendUrl = frontendUrl.endsWith("/") ? frontendUrl.substring(0, frontendUrl.length() - 1) : frontendUrl;
    }

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest req) {
        User user = userRepository.findByEmail(req.email().trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        return buildResponse(user);
    }

    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }
        User user = User.builder()
                .email(req.email())
                .passwordHash(passwordEncoder.encode(req.password()))
                .fullName(req.fullName())
                .phone(req.phone())
                .role(UserRole.CUSTOMER)
                .build();
        userRepository.save(user);
        return buildResponse(user);
    }

    private AuthDtos.AuthResponse buildResponse(User user) {
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return new AuthDtos.AuthResponse(token, toDto(user));
    }

    @Transactional
    public AuthDtos.MessageResponse forgotPassword(AuthDtos.ForgotPasswordRequest req) {
        userRepository.findByEmail(req.email().trim().toLowerCase()).ifPresent(user -> {
            String rawToken = UUID.randomUUID().toString().replace("-", "");
            PasswordResetToken token = PasswordResetToken.builder()
                    .userId(user.getId())
                    .tokenHash(hashToken(rawToken))
                    .expiresAt(Instant.now().plusSeconds(3600))
                    .build();
            resetTokenRepository.save(token);
            String link = frontendUrl + "/reset-password?token=" + rawToken;
            notificationService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), link);
        });
        return new AuthDtos.MessageResponse("If that email is registered, you will receive a reset link shortly.");
    }

    @Transactional
    public AuthDtos.MessageResponse resetPassword(AuthDtos.ResetPasswordRequest req) {
        PasswordResetToken token = resetTokenRepository.findByTokenHashAndUsedAtIsNull(hashToken(req.token()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired reset link"));
        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset link has expired");
        }
        User user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid reset link"));
        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);
        token.setUsedAt(Instant.now());
        resetTokenRepository.save(token);
        return new AuthDtos.MessageResponse("Password updated. You can log in now.");
    }

    private String hashToken(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    public static AuthDtos.UserDto toDto(User user) {
        return new AuthDtos.UserDto(user.getId(), user.getEmail(), user.getFullName(), user.getPhone(), user.getRole());
    }
}
