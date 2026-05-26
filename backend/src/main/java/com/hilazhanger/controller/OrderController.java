package com.hilazhanger.controller;

import com.hilazhanger.dto.AuthDtos;
import com.hilazhanger.dto.OrderDtos;
import com.hilazhanger.repository.UserRepository;
import com.hilazhanger.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    public OrderController(OrderService orderService, UserRepository userRepository) {
        this.orderService = orderService;
        this.userRepository = userRepository;
    }

    @PostMapping("/checkout")
    public OrderDtos.CheckoutResponse checkout(Authentication auth, @Valid @RequestBody OrderDtos.CheckoutRequest request) {
        AuthDtos.UserDto user = loadUser(auth);
        return orderService.checkout(
                user.id(),
                user.fullName(),
                user.email(),
                user.phone() != null ? user.phone() : "0000000000",
                request
        );
    }

    @PostMapping("/guest-checkout")
    public OrderDtos.CheckoutResponse guestCheckout(@Valid @RequestBody OrderDtos.GuestCheckoutRequest request) {
        return orderService.guestCheckout(request);
    }

    @GetMapping("/mine")
    public java.util.List<OrderDtos.OrderDto> myOrders(Authentication auth) {
        AuthDtos.UserDto user = loadUser(auth);
        return orderService.listByUser(user.id());
    }

    @GetMapping("/{id}")
    public OrderDtos.OrderDto getOrder(Authentication auth, @PathVariable UUID id) {
        AuthDtos.UserDto user = loadUser(auth);
        boolean admin = user.role().name().equals("ADMIN");
        return orderService.getOrder(user.id(), id, admin);
    }

    @PostMapping("/verify-payment")
    public OrderDtos.OrderDto verifyPayment(@Valid @RequestBody OrderDtos.VerifyPaymentRequest request) {
        return orderService.verifyPayment(request);
    }

    @PostMapping("/track")
    public OrderDtos.OrderTrackingDto track(@Valid @RequestBody OrderDtos.TrackOrderRequest request) {
        return orderService.trackOrder(request);
    }

    @GetMapping("/{id}/invoice")
    public ResponseEntity<byte[]> invoice(Authentication auth, @PathVariable UUID id) {
        AuthDtos.UserDto user = loadUser(auth);
        boolean admin = user.role().name().equals("ADMIN");
        byte[] pdf = orderService.downloadInvoice(user.id(), id, admin);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    private AuthDtos.UserDto loadUser(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        UUID id = UUID.fromString(auth.getPrincipal().toString());
        return userRepository.findById(id)
                .map(u -> new AuthDtos.UserDto(u.getId(), u.getEmail(), u.getFullName(), u.getPhone(), u.getRole()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }
}
