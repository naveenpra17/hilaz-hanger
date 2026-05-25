package com.hilazhanger.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "product_images")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, length = 500)
    private String url;

    @Column(name = "cloudinary_public_id")
    private String cloudinaryPublicId;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(name = "is_primary", nullable = false)
    private boolean primaryImage;
}
