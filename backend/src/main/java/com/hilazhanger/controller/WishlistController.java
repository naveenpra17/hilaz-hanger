package com.hilazhanger.controller;

import com.hilazhanger.dto.ProductDtos;
import com.hilazhanger.service.WishlistService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public List<ProductDtos.ProductDto> list(Authentication auth) {
        return wishlistService.list(userId(auth));
    }

    @PostMapping("/{productId}")
    public void add(Authentication auth, @PathVariable UUID productId) {
        wishlistService.add(userId(auth), productId);
    }

    @DeleteMapping("/{productId}")
    public void remove(Authentication auth, @PathVariable UUID productId) {
        wishlistService.remove(userId(auth), productId);
    }

    private UUID userId(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return UUID.fromString(auth.getPrincipal().toString());
    }
}
