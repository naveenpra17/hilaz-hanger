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
    private final String webhookSecret;
    private final boolean enabled;

    public RazorpayService(
            @Value("${app.razorpay.key-id:}") String keyId,
            @Value("${app.razorpay.key-secret:}") String keySecret,
            @Value("${app.razorpay.webhook-secret:}") String webhookSecret
    ) {
        this.keyId = keyId;
        this.keySecret = keySecret;
        this.webhookSecret = webhookSecret;
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
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Razorpay is not configured on API. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Render."
            );
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

    public void verifyWebhookSignature(String body, String signature) {
        if (!enabled || webhookSecret == null || webhookSecret.isBlank()) {
            return;
        }
        if (signature == null || signature.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing webhook signature");
        }
        try {
            if (!Utils.verifyWebhookSignature(body, signature, webhookSecret)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid webhook signature");
            }
        } catch (RazorpayException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Webhook verification failed");
        }
    }

    public String refundPayment(String razorpayPaymentId, BigDecimal amountInr) {
        if (!enabled) {
            return null;
        }
        if (razorpayPaymentId == null || razorpayPaymentId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No Razorpay payment to refund");
        }
        try {
            RazorpayClient client = new RazorpayClient(keyId, keySecret);
            JSONObject options = new JSONObject();
            options.put("amount", toPaise(amountInr));
            com.razorpay.Refund refund = client.payments.refund(razorpayPaymentId, options);
            return refund.get("id");
        } catch (RazorpayException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Razorpay refund failed: " + e.getMessage());
        }
    }

    private long toPaise(BigDecimal inr) {
        return inr.multiply(BigDecimal.valueOf(100)).longValue();
    }

    public record RazorpayOrderResult(String razorpayOrderId, String keyId, long amountPaise, boolean live) {}
}
