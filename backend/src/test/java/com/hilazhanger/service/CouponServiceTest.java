package com.hilazhanger.service;

import com.hilazhanger.domain.entity.Coupon;
import com.hilazhanger.dto.CouponDtos;
import com.hilazhanger.repository.CouponRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CouponServiceTest {

    @Mock
    CouponRepository couponRepository;

    @InjectMocks
    CouponService couponService;

    @Test
    void validate_percentCoupon_returnsDiscount() {
        Coupon coupon = activeCoupon("WELCOME10", "PERCENT", "10", "500", 100, 0);
        when(couponRepository.findByCodeIgnoreCase("WELCOME10")).thenReturn(Optional.of(coupon));

        CouponDtos.ValidateCouponResponse res = couponService.validate("welcome10", new BigDecimal("1000"));

        assertTrue(res.valid());
        assertEquals(new BigDecimal("100.00"), res.discountAmount());
    }

    @Test
    void validate_fixedCoupon_capsAtSubtotal() {
        Coupon coupon = activeCoupon("SAVE100", "FIXED", "100", "0", 50, 0);
        when(couponRepository.findByCodeIgnoreCase("SAVE100")).thenReturn(Optional.of(coupon));

        CouponDtos.ValidateCouponResponse res = couponService.validate("SAVE100", new BigDecimal("80"));

        assertTrue(res.valid());
        assertEquals(new BigDecimal("80"), res.discountAmount());
    }

    @Test
    void validate_expiredCoupon_returnsInvalid() {
        Coupon coupon = activeCoupon("OLD", "PERCENT", "10", "0", null, 0);
        coupon.setExpiresAt(Instant.now().minus(1, ChronoUnit.DAYS));
        when(couponRepository.findByCodeIgnoreCase("OLD")).thenReturn(Optional.of(coupon));

        CouponDtos.ValidateCouponResponse res = couponService.validate("OLD", new BigDecimal("1000"));

        assertFalse(res.valid());
    }

    @Test
    void applyAndConsume_incrementsUsedCount() {
        Coupon coupon = activeCoupon("ONCE", "FIXED", "50", "0", 1, 0);
        when(couponRepository.findByCodeIgnoreCase("ONCE")).thenReturn(Optional.of(coupon));
        when(couponRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        BigDecimal discount = couponService.applyAndConsume("ONCE", new BigDecimal("200"));

        assertEquals(new BigDecimal("50"), discount);
        assertEquals(1, coupon.getUsedCount());
        verify(couponRepository).save(coupon);
    }

    @Test
    void applyAndConsume_maxUsesExceeded_throws() {
        Coupon coupon = activeCoupon("MAXED", "FIXED", "10", "0", 1, 1);
        when(couponRepository.findByCodeIgnoreCase("MAXED")).thenReturn(Optional.of(coupon));

        assertThrows(ResponseStatusException.class,
                () -> couponService.applyAndConsume("MAXED", new BigDecimal("500")));
    }

    private Coupon activeCoupon(String code, String type, String value, String min, Integer maxUses, int used) {
        return Coupon.builder()
                .id(UUID.randomUUID())
                .code(code)
                .discountType(type)
                .discountValue(new BigDecimal(value))
                .minOrderAmount(new BigDecimal(min))
                .maxUses(maxUses)
                .usedCount(used)
                .active(true)
                .build();
    }
}
