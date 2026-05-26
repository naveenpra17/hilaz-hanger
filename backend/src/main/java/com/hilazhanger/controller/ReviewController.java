package com.hilazhanger.controller;

import com.hilazhanger.dto.ReviewDtos;
import com.hilazhanger.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/product/{productId}")
    public List<ReviewDtos.ReviewDto> list(@PathVariable UUID productId) {
        return reviewService.listForProduct(productId);
    }

    @PostMapping("/product/{productId}")
    public ReviewDtos.ReviewDto create(Authentication auth, @PathVariable UUID productId,
                                       @Valid @RequestBody ReviewDtos.CreateReviewRequest request) {
        return reviewService.create(userId(auth), productId, request);
    }

    private UUID userId(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return UUID.fromString(auth.getPrincipal().toString());
    }
}
