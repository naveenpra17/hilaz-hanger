package com.hilazhanger.controller;

import com.hilazhanger.domain.enums.OrderStatus;
import com.hilazhanger.dto.CouponDtos;
import com.hilazhanger.dto.OrderDtos;
import com.hilazhanger.dto.UploadDtos;
import com.hilazhanger.dto.CategoryDtos;
import com.hilazhanger.service.CategoryService;
import com.hilazhanger.service.CloudinaryService;
import com.hilazhanger.service.CouponService;
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
    private final CouponService couponService;
    private final CategoryService categoryService;

    public AdminController(
            OrderService orderService,
            CloudinaryService cloudinaryService,
            CouponService couponService,
            CategoryService categoryService
    ) {
        this.orderService = orderService;
        this.cloudinaryService = cloudinaryService;
        this.couponService = couponService;
        this.categoryService = categoryService;
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

    @PatchMapping("/orders/{id}/status")
    public OrderDtos.OrderDto updateStatus(@PathVariable UUID id, @Valid @RequestBody OrderDtos.UpdateOrderStatusRequest request) {
        return orderService.updateStatus(id, request);
    }

    @GetMapping("/coupons")
    public List<CouponDtos.CouponDto> coupons() {
        return couponService.listAll();
    }

    @PostMapping("/coupons")
    public CouponDtos.CouponDto createCoupon(@Valid @RequestBody CouponDtos.CreateCouponRequest request) {
        return couponService.create(request);
    }

    @PutMapping("/coupons/{id}")
    public CouponDtos.CouponDto updateCoupon(@PathVariable UUID id, @Valid @RequestBody CouponDtos.UpdateCouponRequest request) {
        return couponService.update(id, request);
    }

    @DeleteMapping("/coupons/{id}")
    public void deleteCoupon(@PathVariable UUID id) {
        couponService.delete(id);
    }

    @GetMapping("/categories")
    public List<CategoryDtos.CategoryDto> categories() {
        return categoryService.listAll();
    }

    @PostMapping("/categories")
    public CategoryDtos.CategoryDto createCategory(@Valid @RequestBody CategoryDtos.CategoryRequest request) {
        return categoryService.create(request);
    }

    @PutMapping("/categories/{id}")
    public CategoryDtos.CategoryDto updateCategory(@PathVariable UUID id, @Valid @RequestBody CategoryDtos.CategoryRequest request) {
        return categoryService.update(id, request);
    }

    @DeleteMapping("/categories/{id}")
    public void deleteCategory(@PathVariable UUID id) {
        categoryService.delete(id);
    }

    @PostMapping(value = "/upload/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UploadDtos.ImageUploadResponse uploadImage(@RequestParam("file") MultipartFile file) {
        return cloudinaryService.upload(file);
    }
}
