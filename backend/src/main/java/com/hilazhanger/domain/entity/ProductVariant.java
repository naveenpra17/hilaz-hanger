package com.hilazhanger.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "product_variants")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "color_name")
    private String colorName;

    @Column(name = "color_hex")
    private String colorHex;

    @Column(nullable = false)
    private String size;

    private String sku;

    @Column(name = "stock_quantity", nullable = false)
    private int stockQuantity;

    @Column(name = "price_override", precision = 10, scale = 2)
    private BigDecimal priceOverride;
}
