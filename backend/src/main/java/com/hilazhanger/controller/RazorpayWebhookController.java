package com.hilazhanger.controller;

import com.hilazhanger.service.OrderService;
import com.hilazhanger.service.RazorpayService;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/webhooks")
public class RazorpayWebhookController {

    private static final Logger log = LoggerFactory.getLogger(RazorpayWebhookController.class);

    private final RazorpayService razorpayService;
    private final OrderService orderService;

    public RazorpayWebhookController(RazorpayService razorpayService, OrderService orderService) {
        this.razorpayService = razorpayService;
        this.orderService = orderService;
    }

    @PostMapping("/razorpay")
    public ResponseEntity<String> handle(
            @RequestBody String body,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature
    ) {
        razorpayService.verifyWebhookSignature(body, signature);
        JSONObject payload = new JSONObject(body);
        String event = payload.optString("event", "");
        log.info("Razorpay webhook: {}", event);

        if ("payment.captured".equals(event) || "order.paid".equals(event)) {
            JSONObject entity = extractPaymentEntity(payload);
            if (entity != null) {
                String razorpayOrderId = entity.optString("order_id", null);
                String paymentId = entity.optString("id", null);
                if (razorpayOrderId != null && !razorpayOrderId.isBlank()) {
                    orderService.confirmPaymentFromWebhook(razorpayOrderId, paymentId);
                }
            }
        }
        return ResponseEntity.ok("ok");
    }

    private JSONObject extractPaymentEntity(JSONObject payload) {
        JSONObject root = payload.optJSONObject("payload");
        if (root == null) return null;
        JSONObject payment = root.optJSONObject("payment");
        if (payment != null) {
            return payment.optJSONObject("entity");
        }
        JSONObject order = root.optJSONObject("order");
        if (order != null) {
            return order.optJSONObject("entity");
        }
        return null;
    }
}
