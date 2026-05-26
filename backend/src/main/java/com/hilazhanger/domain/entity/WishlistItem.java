package com.hilazhanger.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "wishlists")
@IdClass(WishlistItem.WishlistItemId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistItem {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Id
    @Column(name = "product_id")
    private UUID productId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WishlistItemId implements Serializable {
        private UUID userId;
        private UUID productId;
    }
}
