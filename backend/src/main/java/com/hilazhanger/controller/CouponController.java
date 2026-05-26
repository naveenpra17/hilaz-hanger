package com.hilazhanger.controller;

import com.hilazhanger.dto.CouponDtos;
import com.hilazhanger.service.CouponService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/coupons")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @PostMapping("/validate")
    public CouponDtos.ValidateCouponResponse validate(@Valid @RequestBody CouponDtos.ValidateCouponRequest request) {
        return couponService.validate(request.code(), request.subtotal());
    }
}
