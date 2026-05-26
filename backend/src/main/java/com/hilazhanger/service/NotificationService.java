package com.hilazhanger.service;

import com.hilazhanger.domain.entity.Order;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final JavaMailSender mailSender;
    private final RestClient http = RestClient.create();

    @Value("${app.mail.from:noreply@hilazhanger.com}")
    private String mailFrom;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.sms.enabled:false}")
    private boolean smsEnabled;

    @Value("${app.sms.twilio-account-sid:}")
    private String twilioSid;

    @Value("${app.sms.twilio-auth-token:}")
    private String twilioToken;

    @Value("${app.sms.twilio-from:}")
    private String twilioFrom;

    public NotificationService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOrderConfirmation(Order order) {
        String subject = "Order confirmed — " + order.getOrderNumber();
        String body = buildOrderEmailBody(order);
        sendEmail(order.getCustomerEmail(), subject, body);
        sendSms(order.getCustomerPhone(), "Hilaz Hanger: Order " + order.getOrderNumber()
                + " confirmed. Total ₹" + order.getTotal() + ". Thank you!");
    }

    public void sendOrderStatusUpdate(Order order) {
        String subject = "Order update — " + order.getOrderNumber();
        String body = "Hi " + order.getCustomerName() + ",\n\nYour order status is now: "
                + order.getStatus().name() + ".\n\n— Hilaz Hanger";
        sendEmail(order.getCustomerEmail(), subject, body);
        sendSms(order.getCustomerPhone(), "Hilaz Hanger: Order " + order.getOrderNumber()
                + " is now " + order.getStatus().name() + ".");
    }

    private String buildOrderEmailBody(Order order) {
        StringBuilder sb = new StringBuilder();
        sb.append("Hi ").append(order.getCustomerName()).append(",\n\n");
        sb.append("Thank you for shopping at Hilaz Hanger!\n\n");
        sb.append("Order: ").append(order.getOrderNumber()).append("\n");
        sb.append("Total: ₹").append(order.getTotal()).append("\n");
        sb.append("Status: ").append(order.getStatus()).append("\n\n");
        sb.append("Items:\n");
        order.getItems().forEach(i -> sb.append("  • ")
                .append(i.getProductName())
                .append(" (").append(i.getSize()).append(") x")
                .append(i.getQuantity())
                .append(" — ₹").append(i.getLineTotal()).append("\n"));
        sb.append("\nShip to:\n").append(order.getShippingStreet()).append(", ")
                .append(order.getShippingCity()).append(" — ").append(order.getShippingPincode());
        sb.append("\n\n— Hilaz Hanger");
        return sb.toString();
    }

    private void sendEmail(String to, String subject, String body) {
        if (to == null || to.isBlank()) {
            log.info("Email skipped (no address): {}", subject);
            return;
        }
        if (!mailEnabled || mailSender == null) {
            log.info("[EMAIL preview] To: {} | Subject: {} | Body:\n{}", to, subject, body);
            return;
        }
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(mailFrom);
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(body);
            mailSender.send(msg);
            log.info("Email sent to {}", to);
        } catch (Exception e) {
            log.warn("Email failed to {}: {}", to, e.getMessage());
        }
    }

    private void sendSms(String phone, String text) {
        if (phone == null || phone.isBlank()) {
            return;
        }
        if (!smsEnabled || twilioSid.isBlank() || twilioToken.isBlank() || twilioFrom.isBlank()) {
            log.info("[SMS preview] To: {} | {}", phone, text);
            return;
        }
        try {
            String normalized = phone.replaceAll("\\s", "");
            if (!normalized.startsWith("+")) {
                normalized = "+91" + normalized.replaceFirst("^0", "");
            }
            http.post()
                    .uri("https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json", twilioSid)
                    .headers(h -> h.setBasicAuth(twilioSid, twilioToken))
                    .body("From=" + twilioFrom + "&To=" + normalized + "&Body=" + java.net.URLEncoder.encode(text, java.nio.charset.StandardCharsets.UTF_8))
                    .retrieve()
                    .toBodilessEntity();
            log.info("SMS sent to {}", normalized);
        } catch (Exception e) {
            log.warn("SMS failed to {}: {}", phone, e.getMessage());
        }
    }
}
