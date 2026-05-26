package com.hilazhanger.repository;

import com.hilazhanger.domain.entity.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    Optional<Order> findByRazorpayOrderId(String razorpayOrderId);

    Optional<Order> findByOrderNumberIgnoreCase(String orderNumber);

    @EntityGraph(attributePaths = {"items"})
    List<Order> findTop10ByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"items"})
    List<Order> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"items"})
    List<Order> findByUserIdOrderByCreatedAtDesc(UUID userId);

    @EntityGraph(attributePaths = {"items"})
    @Override
    Optional<Order> findById(UUID id);
}
