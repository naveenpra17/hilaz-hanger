package com.hilazhanger.repository;

import com.hilazhanger.domain.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {

    @EntityGraph(attributePaths = {"images", "variants"})
    Optional<Product> findBySlug(String slug);

    @EntityGraph(attributePaths = {"images", "variants"})
    Optional<Product> findById(UUID id);

    // Only used when search text is non-empty (null search uses findAll — avoids PG lower(bytea) bug)
    @Query("SELECT p FROM Product p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(COALESCE(p.brand, '')) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Product> searchByTerm(@Param("search") String search, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.id IN :ids")
    List<Product> findAllByIdIn(@Param("ids") Collection<UUID> ids);

    Page<Product> findByCategoryIdAndActiveTrue(UUID categoryId, Pageable pageable);

    Page<Product> findByActiveTrue(Pageable pageable);

    List<Product> findByActiveTrue();

    Page<Product> findByActiveFalse(Pageable pageable);

    @Query("SELECT DISTINCT p FROM Product p JOIN p.variants v WHERE v.stockQuantity > 0 AND v.stockQuantity <= 5")
    Page<Product> findLowStock(Pageable pageable);

    @Query("SELECT DISTINCT p FROM Product p JOIN p.variants v WHERE v.stockQuantity = 0")
    Page<Product> findOutOfStock(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.categoryId = :categoryId AND p.active = true AND p.id <> :excludeId")
    List<Product> findRelated(@Param("categoryId") UUID categoryId, @Param("excludeId") UUID excludeId, Pageable pageable);
}
