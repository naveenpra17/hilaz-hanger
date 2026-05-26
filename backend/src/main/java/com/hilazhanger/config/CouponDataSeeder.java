package com.hilazhanger.config;

import com.hilazhanger.domain.entity.Coupon;
import com.hilazhanger.repository.CouponRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Configuration
public class CouponDataSeeder {

    @Bean
    CommandLineRunner seedCoupons(CouponRepository couponRepository) {
        return args -> {
            if (couponRepository.count() > 0) return;
            couponRepository.save(Coupon.builder()
                    .code("WELCOME10")
                    .discountType("PERCENT")
                    .discountValue(new BigDecimal("10"))
                    .minOrderAmount(new BigDecimal("500"))
                    .maxUses(1000)
                    .usedCount(0)
                    .active(true)
                    .expiresAt(Instant.now().plus(365, ChronoUnit.DAYS))
                    .build());
            couponRepository.save(Coupon.builder()
                    .code("SAVE100")
                    .discountType("FIXED")
                    .discountValue(new BigDecimal("100"))
                    .minOrderAmount(new BigDecimal("999"))
                    .maxUses(500)
                    .usedCount(0)
                    .active(true)
                    .expiresAt(Instant.now().plus(180, ChronoUnit.DAYS))
                    .build());
        };
    }
}
