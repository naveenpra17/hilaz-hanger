package com.hilazhanger.service;

import com.hilazhanger.domain.entity.*;
import com.hilazhanger.domain.enums.*;
import com.hilazhanger.dto.OrderDtos;
import com.hilazhanger.repository.OrderRepository;
import com.hilazhanger.repository.ProductVariantRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductVariantRepository variantRepository;
    private final RazorpayService razorpayService;

    public OrderService(
            OrderRepository orderRepository,
            ProductVariantRepository variantRepository,
            RazorpayService razorpayService
    ) {
        this.orderRepository = orderRepository;
        this.variantRepository = variantRepository;
        this.razorpayService = razorpayService;
    }

    @Transactional
    public OrderDtos.CheckoutResponse checkout(UUID userId, String customerName, String customerEmail,
                                               String customerPhone, OrderDtos.CheckoutRequest req) {
        Order order = buildOrder(userId, customerName, customerEmail, customerPhone, OrderSource.WEBSITE, req, false, false);
        order = orderRepository.save(order);

        boolean requiresPayment = !"COD".equalsIgnoreCase(req.paymentMethod());
        if (requiresPayment) {
            RazorpayService.RazorpayOrderResult rz = razorpayService.createOrder(order.getOrderNumber(), order.getTotal());
            order.setRazorpayOrderId(rz.razorpayOrderId());
            order = orderRepository.save(order);
            return new OrderDtos.CheckoutResponse(
                    toDto(order),
                    rz.razorpayOrderId(),
                    rz.keyId(),
                    rz.amountPaise(),
                    true
            );
        }

        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);
        return new OrderDtos.CheckoutResponse(toDto(order), null, razorpayService.getKeyId(), 0L, false);
    }

    @Transactional
    public OrderDtos.OrderDto verifyPayment(OrderDtos.VerifyPaymentRequest req) {
        Order order = orderRepository.findById(req.orderId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        razorpayService.verifySignature(req.razorpayOrderId(), req.razorpayPaymentId(), req.razorpaySignature());
        order.setPaid(true);
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setStatus(OrderStatus.CONFIRMED);
        order.setRazorpayPaymentId(req.razorpayPaymentId());
        return toDto(orderRepository.save(order));
    }

    @Transactional
    public OrderDtos.OrderDto createOffline(OrderDtos.OfflineOrderRequest req) {
        Order order = buildOrder(null, req.customerName(), req.customerEmail(), req.customerPhone(),
                req.orderSource(), toCheckout(req), req.paid(), req.delivered());
        if (req.paid()) {
            order.setPaymentStatus(PaymentStatus.PAID);
            order.setStatus(OrderStatus.CONFIRMED);
        }
        return toDto(orderRepository.save(order));
    }

    public List<OrderDtos.OrderDto> listAll() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toDto).toList();
    }

    public OrderDtos.DashboardStatsDto dashboard() {
        List<Order> all = orderRepository.findAll();
        long total = all.size();

        Map<String, Long> byStatus = all.stream()
                .collect(Collectors.groupingBy(o -> o.getStatus().name(), Collectors.counting()));
        Map<String, Long> byPayment = all.stream()
                .collect(Collectors.groupingBy(o -> o.getPaymentStatus().name(), Collectors.counting()));

        List<OrderDtos.MonthlyCount> monthly = all.stream()
                .collect(Collectors.groupingBy(o -> formatMonth(o.getCreatedAt()), Collectors.counting()))
                .entrySet().stream()
                .map(e -> new OrderDtos.MonthlyCount(e.getKey(), e.getValue()))
                .limit(6)
                .toList();

        List<OrderDtos.TopCustomer> top = all.stream()
                .collect(Collectors.groupingBy(Order::getCustomerName,
                        Collectors.reducing(BigDecimal.ZERO, Order::getTotal, BigDecimal::add)))
                .entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(5)
                .map(e -> new OrderDtos.TopCustomer(e.getKey(), e.getValue().longValue()))
                .toList();

        List<OrderDtos.OrderDto> recent = orderRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(this::toDto).toList();

        return new OrderDtos.DashboardStatsDto(
                total,
                monthly,
                byStatus.entrySet().stream()
                        .map(e -> new OrderDtos.StatusCount(capitalize(e.getKey()), e.getValue()))
                        .toList(),
                byPayment.entrySet().stream()
                        .map(e -> new OrderDtos.StatusCount(capitalize(e.getKey()), e.getValue()))
                        .toList(),
                top,
                recent
        );
    }

    @Transactional
    public OrderDtos.OrderDto markPaid(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        order.setPaid(true);
        order.setPaymentStatus(PaymentStatus.PAID);
        return toDto(orderRepository.save(order));
    }

    private Order buildOrder(UUID userId, String name, String email, String phone, OrderSource source,
                             OrderDtos.CheckoutRequest req, boolean paid, boolean delivered) {
        List<OrderItem> items = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (OrderDtos.CheckoutItemRequest line : req.items()) {
            ProductVariant variant = variantRepository.findById(line.variantId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid variant"));
            if (variant.getStockQuantity() < line.quantity()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient stock for " + variant.getSize());
            }
            Product product = variant.getProduct();
            BigDecimal unit = variant.getPriceOverride() != null ? variant.getPriceOverride() : product.getPrice();
            BigDecimal lineTotal = unit.multiply(BigDecimal.valueOf(line.quantity()));
            subtotal = subtotal.add(lineTotal);

            variant.setStockQuantity(variant.getStockQuantity() - line.quantity());

            OrderItem item = OrderItem.builder()
                    .productId(product.getId())
                    .variantId(variant.getId())
                    .productName(product.getName())
                    .size(variant.getSize())
                    .colorName(variant.getColorName())
                    .unitPrice(unit)
                    .quantity(line.quantity())
                    .lineTotal(lineTotal)
                    .build();
            items.add(item);
        }

        BigDecimal shipping = req.shippingPrice() != null ? req.shippingPrice() : BigDecimal.ZERO;
        BigDecimal discount = req.discount() != null ? req.discount() : BigDecimal.ZERO;
        BigDecimal total = subtotal.add(shipping).subtract(discount).max(BigDecimal.ZERO);

        Order order = Order.builder()
                .orderNumber("HH-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .userId(userId)
                .customerName(name)
                .customerEmail(email)
                .customerPhone(phone)
                .orderSource(source)
                .status(OrderStatus.PENDING)
                .paymentStatus(paid ? PaymentStatus.PAID : PaymentStatus.UNPAID)
                .paymentMethod(req.paymentMethod())
                .subtotal(subtotal)
                .shippingPrice(shipping)
                .discount(discount)
                .total(total)
                .shippingStreet(req.shippingStreet())
                .shippingCity(req.shippingCity())
                .shippingPincode(req.shippingPincode())
                .notes(req.notes())
                .paid(paid)
                .delivered(delivered)
                .build();

        for (OrderItem item : items) {
            item.setOrder(order);
            order.getItems().add(item);
        }
        return order;
    }

    private OrderDtos.CheckoutRequest toCheckout(OrderDtos.OfflineOrderRequest req) {
        return new OrderDtos.CheckoutRequest(
                req.items(), req.shippingStreet(), req.shippingCity(), req.shippingPincode(),
                req.shippingPrice(), req.discount(), req.paymentMethod(), req.notes()
        );
    }

    private OrderDtos.OrderDto toDto(Order o) {
        return new OrderDtos.OrderDto(
                o.getId(),
                o.getOrderNumber(),
                o.getCustomerName(),
                o.getCustomerEmail(),
                o.getCustomerPhone(),
                o.getOrderSource(),
                o.getStatus(),
                o.getPaymentStatus(),
                o.getPaymentMethod(),
                o.getSubtotal(),
                o.getShippingPrice(),
                o.getDiscount(),
                o.getTotal(),
                o.getShippingStreet(),
                o.getShippingCity(),
                o.getShippingPincode(),
                o.getNotes(),
                o.isPaid(),
                o.isDelivered(),
                o.getItems().stream().map(i -> new OrderDtos.OrderItemDto(
                        i.getId(), i.getProductName(), i.getSize(), i.getColorName(),
                        i.getUnitPrice(), i.getQuantity(), i.getLineTotal(), null
                )).toList(),
                o.getCreatedAt()
        );
    }

    private String formatMonth(Instant instant) {
        return DateTimeFormatter.ofPattern("MMM yy")
                .withZone(ZoneId.of("Asia/Kolkata"))
                .format(instant);
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return s.charAt(0) + s.substring(1).toLowerCase();
    }
}
