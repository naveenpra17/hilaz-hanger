package com.hilazhanger.service;

import com.hilazhanger.domain.entity.User;
import com.hilazhanger.domain.enums.UserRole;
import com.hilazhanger.dto.AuthDtos;
import com.hilazhanger.repository.UserRepository;
import com.hilazhanger.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest req) {
        User user = userRepository.findByEmail(req.email())
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

    public static AuthDtos.UserDto toDto(User user) {
        return new AuthDtos.UserDto(user.getId(), user.getEmail(), user.getFullName(), user.getPhone(), user.getRole());
    }
}
