package com.hilazhanger.dto;

import com.hilazhanger.domain.enums.OrderSource;
import com.hilazhanger.domain.enums.OrderStatus;
import com.hilazhanger.domain.enums.PaymentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class OrderDtos {

    private OrderDtos() {}

    public record OrderItemDto(
            UUID id,
            String productName,
            String size,
            String colorName,
            BigDecimal unitPrice,
            int quantity,
            BigDecimal lineTotal,
            String imageUrl
    ) {}

    public record OrderDto(
            UUID id,
            String orderNumber,
            String customerName,
            String customerEmail,
            String customerPhone,
            OrderSource orderSource,
            OrderStatus status,
            PaymentStatus paymentStatus,
            String paymentMethod,
            BigDecimal subtotal,
            BigDecimal shippingPrice,
            BigDecimal discount,
            BigDecimal total,
            String shippingStreet,
            String shippingCity,
            String shippingPincode,
            String notes,
            boolean paid,
            boolean delivered,
            String couponCode,
            List<OrderItemDto> items,
            Instant createdAt
    ) {}

    public record CheckoutItemRequest(
            @NotNull UUID variantId,
            @NotNull Integer quantity
    ) {}

    public record CheckoutRequest(
            @NotEmpty List<CheckoutItemRequest> items,
            @NotBlank String shippingStreet,
            @NotBlank String shippingCity,
            @NotBlank String shippingPincode,
            BigDecimal shippingPrice,
            BigDecimal discount,
            String couponCode,
            @NotBlank String paymentMethod,
            String notes
    ) {}

    public record UpdateOrderStatusRequest(
            @NotNull OrderStatus status
    ) {}

    public record GuestCheckoutRequest(
            @NotBlank String customerName,
            @NotBlank String customerEmail,
            @NotBlank String customerPhone,
            @NotEmpty List<CheckoutItemRequest> items,
            @NotBlank String shippingStreet,
            @NotBlank String shippingCity,
            @NotBlank String shippingPincode,
            BigDecimal shippingPrice,
            BigDecimal discount,
            String couponCode,
            @NotBlank String paymentMethod,
            String notes
    ) {}

    public record CheckoutResponse(
            OrderDto order,
            String razorpayOrderId,
            String razorpayKeyId,
            Long amountPaise,
            boolean requiresPayment
    ) {}

    public record VerifyPaymentRequest(
            @NotNull UUID orderId,
            @NotBlank String razorpayOrderId,
            @NotBlank String razorpayPaymentId,
            @NotBlank String razorpaySignature
    ) {}

    public record OfflineOrderRequest(
            @NotBlank String customerName,
            @NotBlank String customerPhone,
            String customerEmail,
            @NotNull OrderSource orderSource,
            @NotEmpty List<CheckoutItemRequest> items,
            @NotBlank String shippingStreet,
            @NotBlank String shippingCity,
            @NotBlank String shippingPincode,
            BigDecimal shippingPrice,
            BigDecimal discount,
            @NotBlank String paymentMethod,
            boolean paid,
            boolean delivered,
            String notes
    ) {}

    public record DashboardStatsDto(
            long totalOrders,
            List<MonthlyCount> monthlyOrders,
            List<StatusCount> orderStatusBreakdown,
            List<StatusCount> paymentStatusBreakdown,
            List<TopCustomer> topCustomers,
            List<OrderDto> recentOrders
    ) {}

    public record MonthlyCount(String label, long count) {}
    public record StatusCount(String status, long count) {}
    public record TopCustomer(String name, long revenue) {}
}
