package com.hilazhanger.repository;

import com.hilazhanger.domain.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {

    @EntityGraph(attributePaths = {"images", "variants"})
    Optional<Product> findBySlug(String slug);

    @EntityGraph(attributePaths = {"images", "variants"})
    Optional<Product> findById(UUID id);

    @EntityGraph(attributePaths = {"images", "variants"})
    @Query("SELECT p FROM Product p WHERE " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:activeOnly IS NULL OR p.active = :activeOnly)")
    Page<Product> search(@Param("search") String search, @Param("activeOnly") Boolean activeOnly, Pageable pageable);
}
