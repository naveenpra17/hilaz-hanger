package com.hilazhanger.repository;

import com.hilazhanger.domain.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findTop10ByOrderByCreatedAtDesc();
    List<Order> findAllByOrderByCreatedAtDesc();
}
