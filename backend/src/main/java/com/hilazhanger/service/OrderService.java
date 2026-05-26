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
    private final CouponService couponService;
    private final NotificationService notificationService;
    private final ShippingService shippingService;
    private final GstService gstService;
    private final InvoiceService invoiceService;

    public OrderService(
            OrderRepository orderRepository,
            ProductVariantRepository variantRepository,
            RazorpayService razorpayService,
            CouponService couponService,
            NotificationService notificationService,
            ShippingService shippingService,
            GstService gstService,
            InvoiceService invoiceService
    ) {
        this.orderRepository = orderRepository;
        this.variantRepository = variantRepository;
        this.razorpayService = razorpayService;
        this.couponService = couponService;
        this.notificationService = notificationService;
        this.shippingService = shippingService;
        this.gstService = gstService;
        this.invoiceService = invoiceService;
    }

    @Transactional
    public OrderDtos.CheckoutResponse guestCheckout(OrderDtos.GuestCheckoutRequest req) {
        OrderDtos.CheckoutRequest checkout = new OrderDtos.CheckoutRequest(
                req.items(), req.shippingStreet(), req.shippingCity(), req.shippingPincode(),
                req.shippingPrice(), req.discount(), req.couponCode(), req.paymentMethod(), req.notes()
        );
        Order order = buildOrder(null, req.customerName(), req.customerEmail(), req.customerPhone(),
                OrderSource.WEBSITE, checkout, false, false);
        order = orderRepository.save(order);
        return finalizeCheckout(order, req.paymentMethod());
    }

    @Transactional(readOnly = true)
    public OrderDtos.OrderDto getOrder(UUID userId, UUID orderId, boolean admin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!admin && (order.getUserId() == null || !order.getUserId().equals(userId))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        return toDto(order);
    }

    @Transactional
    public OrderDtos.CheckoutResponse checkout(UUID userId, String customerName, String customerEmail,
                                               String customerPhone, OrderDtos.CheckoutRequest req) {
        Order order = buildOrder(userId, customerName, customerEmail, customerPhone, OrderSource.WEBSITE, req, false, false);
        order = orderRepository.save(order);
        return finalizeCheckout(order, req.paymentMethod());
    }

    private OrderDtos.CheckoutResponse finalizeCheckout(Order order, String paymentMethod) {
        boolean requiresPayment = !"COD".equalsIgnoreCase(paymentMethod);
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
        // COD: order is confirmed; payment collected on delivery
        order.setStatus(OrderStatus.CONFIRMED);
        order.setPaymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod() : "COD");
        order = orderRepository.save(order);
        notificationService.sendOrderConfirmation(order);
        return new OrderDtos.CheckoutResponse(toDto(order), null, razorpayService.getKeyId(), 0L, false);
    }

    @Transactional
    public OrderDtos.OrderDto verifyPayment(OrderDtos.VerifyPaymentRequest req) {
        Order order = orderRepository.findById(req.orderId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (order.getRazorpayOrderId() != null && !order.getRazorpayOrderId().equals(req.razorpayOrderId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment does not match this order");
        }
        razorpayService.verifySignature(req.razorpayOrderId(), req.razorpayPaymentId(), req.razorpaySignature());
        return toDto(markPaid(order, req.razorpayPaymentId()));
    }

    @Transactional
    public void confirmPaymentFromWebhook(String razorpayOrderId, String razorpayPaymentId) {
        orderRepository.findByRazorpayOrderId(razorpayOrderId).ifPresent(order -> {
            if (!order.isPaid()) {
                markPaid(order, razorpayPaymentId);
            }
        });
    }

    public byte[] downloadInvoice(UUID userId, UUID orderId, boolean admin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!admin && (order.getUserId() == null || !order.getUserId().equals(userId))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        return invoiceService.generatePdf(order);
    }

    private Order markPaid(Order order, String razorpayPaymentId) {
        if (order.isPaid()) {
            return order;
        }
        order.setPaid(true);
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setStatus(OrderStatus.CONFIRMED);
        if (razorpayPaymentId != null && !razorpayPaymentId.isBlank()) {
            order.setRazorpayPaymentId(razorpayPaymentId);
        }
        order = orderRepository.save(order);
        notificationService.sendOrderConfirmation(order);
        return order;
    }

    @Transactional
    public OrderDtos.OrderDto createOffline(OrderDtos.OfflineOrderRequest req) {
        Order order = buildOrder(null, req.customerName(), req.customerEmail(), req.customerPhone(),
                req.orderSource(), toCheckout(req), req.paid(), req.delivered());
        if (req.paid()) {
            order.setPaymentStatus(PaymentStatus.PAID);
            order.setStatus(OrderStatus.CONFIRMED);
        }
        order = orderRepository.save(order);
        if (order.getStatus() == OrderStatus.CONFIRMED) {
            notificationService.sendOrderConfirmation(order);
        }
        return toDto(order);
    }

    @Transactional(readOnly = true)
    public List<OrderDtos.OrderDto> listAll() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<OrderDtos.OrderDto> listByUser(UUID userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
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
        if (order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.CONFIRMED);
        }
        return toDto(orderRepository.save(order));
    }

    public OrderDtos.OrderTrackingDto trackOrder(OrderDtos.TrackOrderRequest req) {
        Order order = orderRepository.findByOrderNumberIgnoreCase(req.orderNumber().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        String email = req.email().trim().toLowerCase();
        if (order.getCustomerEmail() == null
                || !order.getCustomerEmail().trim().toLowerCase().equals(email)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }
        return new OrderDtos.OrderTrackingDto(
                order.getOrderNumber(),
                order.getStatus(),
                order.isPaid(),
                order.isDelivered(),
                order.getTrackingNumber(),
                order.getCourierName(),
                order.getCreatedAt()
        );
    }

    @Transactional
    public OrderDtos.OrderDto updateStatus(UUID orderId, OrderDtos.UpdateOrderStatusRequest req) {
        OrderStatus newStatus = req.status();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (newStatus == OrderStatus.CANCELLED) {
            if (order.getStatus() == OrderStatus.DELIVERED) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot cancel a delivered order");
            }
            if (order.getStatus() != OrderStatus.CANCELLED) {
                restoreStock(order);
                if (order.isPaid() && order.getRazorpayPaymentId() != null && !order.getRazorpayPaymentId().isBlank()) {
                    String refundId = razorpayService.refundPayment(order.getRazorpayPaymentId(), order.getTotal());
                    order.setRazorpayRefundId(refundId);
                }
                order.setStatus(OrderStatus.CANCELLED);
                if (order.isPaid()) {
                    order.setPaymentStatus(PaymentStatus.REFUNDED);
                }
            }
        } else if (newStatus == OrderStatus.SHIPPED) {
            if (order.getStatus() == OrderStatus.CANCELLED) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot ship a cancelled order");
            }
            order.setStatus(OrderStatus.SHIPPED);
            if (req.trackingNumber() != null && !req.trackingNumber().isBlank()) {
                order.setTrackingNumber(req.trackingNumber().trim());
            }
            if (req.courierName() != null && !req.courierName().isBlank()) {
                order.setCourierName(req.courierName().trim());
            }
        } else if (newStatus == OrderStatus.DELIVERED) {
            order.setStatus(OrderStatus.DELIVERED);
            order.setDelivered(true);
        } else if (newStatus == OrderStatus.CONFIRMED) {
            order.setStatus(OrderStatus.CONFIRMED);
        } else {
            order.setStatus(newStatus);
        }

        order = orderRepository.save(order);
        notificationService.sendOrderStatusUpdate(order);
        return toDto(order);
    }

    private void restoreStock(Order order) {
        for (OrderItem item : order.getItems()) {
            if (item.getVariantId() == null) continue;
            variantRepository.findById(item.getVariantId()).ifPresent(v ->
                    v.setStockQuantity(v.getStockQuantity() + item.getQuantity()));
        }
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

        BigDecimal discount = BigDecimal.ZERO;
        String couponCode = null;

        if (req.couponCode() != null && !req.couponCode().isBlank()) {
            couponCode = req.couponCode().trim().toUpperCase();
            discount = couponService.applyAndConsume(couponCode, subtotal);
        }
        // Never trust client-sent discount amounts — coupons only (Flipkart/Amazon model)

        BigDecimal taxableBase = subtotal.subtract(discount).max(BigDecimal.ZERO);
        BigDecimal shipping = shippingService.calculate(taxableBase);
        GstService.GstBreakdown gst = gstService.calculate(taxableBase);
        BigDecimal total = taxableBase.add(gst.taxAmount()).add(shipping).max(BigDecimal.ZERO);

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
                .couponCode(couponCode)
                .taxableAmount(gst.taxableAmount())
                .taxRate(gst.taxRate())
                .taxAmount(gst.taxAmount())
                .cgstAmount(gst.cgstAmount())
                .sgstAmount(gst.sgstAmount())
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
                req.shippingPrice(), req.discount(), null, req.paymentMethod(), req.notes()
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
                o.getTaxableAmount(),
                o.getTaxRate(),
                o.getTaxAmount(),
                o.getCgstAmount(),
                o.getSgstAmount(),
                o.getTotal(),
                o.getShippingStreet(),
                o.getShippingCity(),
                o.getShippingPincode(),
                o.getNotes(),
                o.isPaid(),
                o.isDelivered(),
                o.getCouponCode(),
                o.getTrackingNumber(),
                o.getCourierName(),
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
