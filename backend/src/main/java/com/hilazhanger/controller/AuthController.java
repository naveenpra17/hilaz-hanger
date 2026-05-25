package com.hilazhanger.controller;

import com.hilazhanger.dto.AuthDtos;
import com.hilazhanger.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthDtos.AuthResponse login(@Valid @RequestBody AuthDtos.LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/register")
    public AuthDtos.AuthResponse register(@Valid @RequestBody AuthDtos.RegisterRequest request) {
        return authService.register(request);
    }
}
