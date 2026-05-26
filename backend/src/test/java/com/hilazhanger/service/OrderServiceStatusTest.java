package com.hilazhanger.service;

import com.hilazhanger.domain.entity.Order;
import com.hilazhanger.domain.entity.OrderItem;
import com.hilazhanger.domain.entity.ProductVariant;
import com.hilazhanger.domain.enums.*;
import com.hilazhanger.repository.OrderRepository;
import com.hilazhanger.repository.ProductVariantRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceStatusTest {

    @Mock
    OrderRepository orderRepository;
    @Mock
    ProductVariantRepository variantRepository;
    @Mock
    RazorpayService razorpayService;
    @Mock
    CouponService couponService;
    @Mock
    NotificationService notificationService;

    @InjectMocks
    OrderService orderService;

    @Test
    void updateStatus_shipped_setsStatus() {
        Order order = sampleOrder(OrderStatus.CONFIRMED);
        when(orderRepository.findById(order.getId())).thenReturn(Optional.of(order));
        when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var dto = orderService.updateStatus(order.getId(), OrderStatus.SHIPPED);

        assertEquals(OrderStatus.SHIPPED, dto.status());
        verify(notificationService).sendOrderStatusUpdate(any());
    }

    @Test
    void updateStatus_cancelled_restoresStock() {
        UUID variantId = UUID.randomUUID();
        Order order = sampleOrder(OrderStatus.CONFIRMED);
        OrderItem item = OrderItem.builder()
                .variantId(variantId)
                .quantity(2)
                .productName("Dress")
                .unitPrice(BigDecimal.TEN)
                .lineTotal(BigDecimal.valueOf(20))
                .build();
        item.setOrder(order);
        order.getItems().add(item);

        ProductVariant variant = ProductVariant.builder().id(variantId).stockQuantity(3).size("M").build();

        when(orderRepository.findById(order.getId())).thenReturn(Optional.of(order));
        when(variantRepository.findById(variantId)).thenReturn(Optional.of(variant));
        when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        orderService.updateStatus(order.getId(), OrderStatus.CANCELLED);

        assertEquals(5, variant.getStockQuantity());
        assertEquals(OrderStatus.CANCELLED, order.getStatus());
    }

    @Test
    void updateStatus_cancelDeliveredOrder_throws() {
        Order order = sampleOrder(OrderStatus.DELIVERED);
        when(orderRepository.findById(order.getId())).thenReturn(Optional.of(order));

        assertThrows(ResponseStatusException.class,
                () -> orderService.updateStatus(order.getId(), OrderStatus.CANCELLED));
    }

    private Order sampleOrder(OrderStatus status) {
        return Order.builder()
                .id(UUID.randomUUID())
                .orderNumber("HH-TEST123")
                .customerName("Test")
                .customerPhone("9999999999")
                .orderSource(OrderSource.WEBSITE)
                .status(status)
                .paymentStatus(PaymentStatus.PAID)
                .subtotal(BigDecimal.valueOf(100))
                .shippingPrice(BigDecimal.ZERO)
                .discount(BigDecimal.ZERO)
                .total(BigDecimal.valueOf(100))
                .shippingStreet("1 St")
                .shippingCity("City")
                .shippingPincode("641001")
                .paid(true)
                .delivered(status == OrderStatus.DELIVERED)
                .items(new java.util.ArrayList<>())
                .build();
    }
}
