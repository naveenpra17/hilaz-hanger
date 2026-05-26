package com.hilazhanger.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class ShippingService {

    private static final BigDecimal FREE_SHIPPING_MIN = new BigDecimal("999");
    private static final BigDecimal STANDARD_SHIPPING = new BigDecimal("99");

    public BigDecimal calculate(BigDecimal subtotal) {
        if (subtotal == null || subtotal.compareTo(FREE_SHIPPING_MIN) >= 0) {
            return BigDecimal.ZERO;
        }
        return STANDARD_SHIPPING;
    }
}
