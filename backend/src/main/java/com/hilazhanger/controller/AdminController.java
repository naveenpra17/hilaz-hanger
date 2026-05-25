package com.hilazhanger.controller;

import com.hilazhanger.dto.OrderDtos;
import com.hilazhanger.dto.UploadDtos;
import com.hilazhanger.service.CloudinaryService;
import com.hilazhanger.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final OrderService orderService;
    private final CloudinaryService cloudinaryService;

    public AdminController(OrderService orderService, CloudinaryService cloudinaryService) {
        this.orderService = orderService;
        this.cloudinaryService = cloudinaryService;
    }

    @GetMapping("/dashboard")
    public OrderDtos.DashboardStatsDto dashboard() {
        return orderService.dashboard();
    }

    @GetMapping("/orders")
    public List<OrderDtos.OrderDto> orders() {
        return orderService.listAll();
    }

    @PostMapping("/orders/offline")
    public OrderDtos.OrderDto offlineOrder(@Valid @RequestBody OrderDtos.OfflineOrderRequest request) {
        return orderService.createOffline(request);
    }

    @PatchMapping("/orders/{id}/mark-paid")
    public OrderDtos.OrderDto markPaid(@PathVariable UUID id) {
        return orderService.markPaid(id);
    }

    @PostMapping(value = "/upload/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UploadDtos.ImageUploadResponse uploadImage(@RequestParam("file") MultipartFile file) {
        return cloudinaryService.upload(file);
    }
}
