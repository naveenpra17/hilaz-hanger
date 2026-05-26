package com.hilazhanger.service;

import com.hilazhanger.domain.entity.Product;
import com.hilazhanger.domain.entity.Review;
import com.hilazhanger.dto.ReviewDtos;
import com.hilazhanger.repository.ProductRepository;
import com.hilazhanger.repository.ReviewRepository;
import com.hilazhanger.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository, ProductRepository productRepository,
                         UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public List<ReviewDtos.ReviewDto> listForProduct(UUID productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public ReviewDtos.ReviewDto create(UUID userId, UUID productId, ReviewDtos.CreateReviewRequest req) {
        if (!productRepository.existsById(productId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        }
        if (req.rating() < 1 || req.rating() > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating must be 1–5");
        }
        Review review = Review.builder()
                .productId(productId)
                .userId(userId)
                .rating(req.rating())
                .title(req.title())
                .body(req.body())
                .build();
        review = reviewRepository.save(review);
        refreshProductRatings(productId);
        return toDto(review);
    }

    private void refreshProductRatings(UUID productId) {
        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
        Product product = productRepository.findById(productId).orElseThrow();
        if (reviews.isEmpty()) {
            product.setRatingAvg(BigDecimal.ZERO);
            product.setReviewCount(0);
        } else {
            double avg = reviews.stream().mapToInt(Review::getRating).average().orElse(0);
            product.setRatingAvg(BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP));
            product.setReviewCount(reviews.size());
        }
        productRepository.save(product);
    }

    private ReviewDtos.ReviewDto toDto(Review r) {
        String author = userRepository.findById(r.getUserId())
                .map(u -> u.getFullName())
                .orElse("Customer");
        return new ReviewDtos.ReviewDto(r.getId(), r.getProductId(), r.getUserId(), author, r.getRating(),
                r.getTitle(), r.getBody(), r.getCreatedAt());
    }
}
