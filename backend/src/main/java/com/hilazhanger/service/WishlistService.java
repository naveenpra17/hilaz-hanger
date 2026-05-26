package com.hilazhanger.service;

import com.hilazhanger.domain.entity.Product;
import com.hilazhanger.domain.entity.WishlistItem;
import com.hilazhanger.dto.ProductDtos;
import com.hilazhanger.repository.ProductRepository;
import com.hilazhanger.repository.WishlistRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    public WishlistService(WishlistRepository wishlistRepository, ProductRepository productRepository,
                           ProductService productService) {
        this.wishlistRepository = wishlistRepository;
        this.productRepository = productRepository;
        this.productService = productService;
    }

    public List<ProductDtos.ProductDto> list(UUID userId) {
        return wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(WishlistItem::getProductId)
                .map(productService::getById)
                .toList();
    }

    @Transactional
    public void add(UUID userId, UUID productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        }
        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            return;
        }
        wishlistRepository.save(WishlistItem.builder().userId(userId).productId(productId).build());
    }

    @Transactional
    public void remove(UUID userId, UUID productId) {
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
    }
}
