package com.hilazhanger.repository;

import com.hilazhanger.domain.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface WishlistRepository extends JpaRepository<WishlistItem, WishlistItem.WishlistItemId> {
    List<WishlistItem> findByUserIdOrderByCreatedAtDesc(UUID userId);
    boolean existsByUserIdAndProductId(UUID userId, UUID productId);
    void deleteByUserIdAndProductId(UUID userId, UUID productId);
}
