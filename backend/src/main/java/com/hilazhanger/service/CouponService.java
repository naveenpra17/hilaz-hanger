package com.hilazhanger.service;

import com.hilazhanger.domain.entity.Coupon;
import com.hilazhanger.dto.CouponDtos;
import com.hilazhanger.repository.CouponRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class CouponService {

    public static final String TYPE_PERCENT = "PERCENT";
    public static final String TYPE_FIXED = "FIXED";

    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    public List<CouponDtos.CouponDto> listAll() {
        return couponRepository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional
    public CouponDtos.CouponDto create(CouponDtos.CreateCouponRequest req) {
        String code = req.code().trim().toUpperCase();
        if (couponRepository.findByCodeIgnoreCase(code).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Coupon code already exists");
        }
        Coupon coupon = Coupon.builder()
                .code(code)
                .discountType(req.discountType().toUpperCase())
                .discountValue(req.discountValue())
                .minOrderAmount(req.minOrderAmount() != null ? req.minOrderAmount() : BigDecimal.ZERO)
                .maxUses(req.maxUses())
                .usedCount(0)
                .active(req.active())
                .expiresAt(req.expiresAt())
                .build();
        return toDto(couponRepository.save(coupon));
    }

    @Transactional
    public CouponDtos.CouponDto update(UUID id, CouponDtos.UpdateCouponRequest req) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        coupon.setDiscountType(req.discountType().toUpperCase());
        coupon.setDiscountValue(req.discountValue());
        coupon.setMinOrderAmount(req.minOrderAmount() != null ? req.minOrderAmount() : BigDecimal.ZERO);
        coupon.setMaxUses(req.maxUses());
        coupon.setActive(req.active());
        coupon.setExpiresAt(req.expiresAt());
        return toDto(couponRepository.save(coupon));
    }

    @Transactional
    public void delete(UUID id) {
        if (!couponRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        couponRepository.deleteById(id);
    }

    public CouponDtos.ValidateCouponResponse validate(String code, BigDecimal subtotal) {
        try {
            BigDecimal discount = calculateDiscount(code, subtotal, false);
            Coupon coupon = couponRepository.findByCodeIgnoreCase(code.trim().toUpperCase())
                    .orElseThrow();
            return new CouponDtos.ValidateCouponResponse(
                    true,
                    "Coupon applied",
                    discount,
                    coupon.getDiscountType(),
                    coupon.getDiscountValue()
            );
        } catch (ResponseStatusException ex) {
            return new CouponDtos.ValidateCouponResponse(false, ex.getReason(), BigDecimal.ZERO, null, null);
        }
    }

    @Transactional
    public BigDecimal applyAndConsume(String code, BigDecimal subtotal) {
        BigDecimal discount = calculateDiscount(code, subtotal, true);
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code.trim().toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid coupon"));
        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);
        return discount;
    }

    private BigDecimal calculateDiscount(String code, BigDecimal subtotal, boolean forCheckout) {
        if (code == null || code.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coupon code required");
        }
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code.trim().toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid coupon code"));

        if (!coupon.isActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coupon is inactive");
        }
        if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coupon has expired");
        }
        if (coupon.getMaxUses() != null && coupon.getUsedCount() >= coupon.getMaxUses()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coupon usage limit reached");
        }
        BigDecimal min = coupon.getMinOrderAmount() != null ? coupon.getMinOrderAmount() : BigDecimal.ZERO;
        if (subtotal.compareTo(min) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Minimum order amount is ₹" + min.stripTrailingZeros().toPlainString());
        }

        BigDecimal discount;
        if (TYPE_FIXED.equalsIgnoreCase(coupon.getDiscountType())) {
            discount = coupon.getDiscountValue().min(subtotal);
        } else {
            discount = subtotal.multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        }
        return discount.max(BigDecimal.ZERO).min(subtotal);
    }

    private CouponDtos.CouponDto toDto(Coupon c) {
        return new CouponDtos.CouponDto(
                c.getId(),
                c.getCode(),
                c.getDiscountType(),
                c.getDiscountValue(),
                c.getMinOrderAmount(),
                c.getMaxUses(),
                c.getUsedCount(),
                c.isActive(),
                c.getExpiresAt()
        );
    }
}
