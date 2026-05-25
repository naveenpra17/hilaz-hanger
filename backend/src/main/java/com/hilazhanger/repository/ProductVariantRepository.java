package com.hilazhanger.repository;

import com.hilazhanger.domain.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, UUID> {}
