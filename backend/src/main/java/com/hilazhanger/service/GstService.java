package com.hilazhanger.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class GstService {

    private final BigDecimal defaultRate;

    public GstService(@Value("${app.gst.rate-percent:18}") BigDecimal ratePercent) {
        this.defaultRate = ratePercent != null ? ratePercent : BigDecimal.valueOf(18);
    }

    public GstBreakdown calculate(BigDecimal taxableBase) {
        BigDecimal base = taxableBase.max(BigDecimal.ZERO);
        BigDecimal rate = defaultRate;
        BigDecimal tax = base.multiply(rate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal half = tax.divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
        return new GstBreakdown(base, rate, tax, half, half);
    }

    public record GstBreakdown(
            BigDecimal taxableAmount,
            BigDecimal taxRate,
            BigDecimal taxAmount,
            BigDecimal cgstAmount,
            BigDecimal sgstAmount
    ) {}
}
