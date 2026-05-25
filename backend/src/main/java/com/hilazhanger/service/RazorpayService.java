package com.hilazhanger.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;

@Service
public class RazorpayService {

    private final String keyId;
    private final String keySecret;
    private final boolean enabled;

    public RazorpayService(
            @Value("${app.razorpay.key-id:}") String keyId,
            @Value("${app.razorpay.key-secret:}") String keySecret
    ) {
        this.keyId = keyId;
        this.keySecret = keySecret;
        this.enabled = keyId != null && !keyId.isBlank()
                && keySecret != null && !keySecret.isBlank()
                && !keyId.contains("YOUR");
    }

    public boolean isEnabled() {
        return enabled;
    }

    public String getKeyId() {
        return keyId;
    }

    public RazorpayOrderResult createOrder(String receipt, BigDecimal amountInr) {
        if (!enabled) {
            return new RazorpayOrderResult(null, keyId.isBlank() ? "rzp_test_placeholder" : keyId, toPaise(amountInr), false);
        }
        try {
            RazorpayClient client = new RazorpayClient(keyId, keySecret);
            JSONObject options = new JSONObject();
            options.put("amount", toPaise(amountInr));
            options.put("currency", "INR");
            options.put("receipt", receipt);
            Order order = client.orders.create(options);
            return new RazorpayOrderResult(order.get("id"), keyId, toPaise(amountInr), true);
        } catch (RazorpayException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Razorpay order failed: " + e.getMessage());
        }
    }

    public void verifySignature(String razorpayOrderId, String paymentId, String signature) {
        if (!enabled) {
            return;
        }
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", razorpayOrderId);
            options.put("razorpay_payment_id", paymentId);
            options.put("razorpay_signature", signature);
            if (!Utils.verifyPaymentSignature(options, keySecret)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid payment signature");
            }
        } catch (RazorpayException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment verification failed");
        }
    }

    private long toPaise(BigDecimal inr) {
        return inr.multiply(BigDecimal.valueOf(100)).longValue();
    }

    public record RazorpayOrderResult(String razorpayOrderId, String keyId, long amountPaise, boolean live) {}
}
