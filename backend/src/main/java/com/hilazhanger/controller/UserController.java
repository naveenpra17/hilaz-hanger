package com.hilazhanger.controller;

import com.hilazhanger.dto.AuthDtos;
import com.hilazhanger.repository.UserRepository;
import com.hilazhanger.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/users/me")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    public UserController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public AuthDtos.UserDto profile(Authentication auth) {
        return userService.getProfile(userId(auth));
    }

    @PatchMapping
    public AuthDtos.UserDto update(Authentication auth, @Valid @RequestBody AuthDtos.UpdateProfileRequest request) {
        return userService.updateProfile(userId(auth), request);
    }

    @PatchMapping("/password")
    public void changePassword(Authentication auth, @Valid @RequestBody AuthDtos.ChangePasswordRequest request) {
        userService.changePassword(userId(auth), request);
    }

    private UUID userId(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return UUID.fromString(auth.getPrincipal().toString());
    }
}
