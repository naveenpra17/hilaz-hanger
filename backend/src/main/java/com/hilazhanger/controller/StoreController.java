package com.hilazhanger.controller;

import com.hilazhanger.dto.MiscDtos;
import com.hilazhanger.domain.entity.NewsletterSubscriber;
import com.hilazhanger.repository.NewsletterSubscriberRepository;
import com.hilazhanger.service.NotificationService;
import com.hilazhanger.service.ShippingService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
public class StoreController {

    private static final Logger log = LoggerFactory.getLogger(StoreController.class);

    private final NewsletterSubscriberRepository newsletterRepository;
    private final NotificationService notificationService;
    private final ShippingService shippingService;

    @Value("${app.mail.from:noreply@hilazhanger.com}")
    private String mailFrom;

    public StoreController(NewsletterSubscriberRepository newsletterRepository,
                           NotificationService notificationService,
                           ShippingService shippingService) {
        this.newsletterRepository = newsletterRepository;
        this.notificationService = notificationService;
        this.shippingService = shippingService;
    }

    @PostMapping("/contact")
    public MiscDtos.ContactResponse contact(@Valid @RequestBody MiscDtos.ContactRequest request) {
        log.info("Contact form: {} <{}> — {}", request.name(), request.email(), request.message());
        return new MiscDtos.ContactResponse("Thank you! We will get back to you within 24 hours.");
    }

    @PostMapping("/newsletter/subscribe")
    public MiscDtos.NewsletterResponse subscribe(@Valid @RequestBody MiscDtos.NewsletterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (newsletterRepository.findByEmailIgnoreCase(email).isEmpty()) {
            newsletterRepository.save(NewsletterSubscriber.builder().email(email).active(true).build());
        }
        return new MiscDtos.NewsletterResponse("Subscribed! Watch your inbox for offers.");
    }

    @GetMapping("/shipping/quote")
    public MiscDtos.ShippingQuoteResponse shippingQuote(@RequestParam BigDecimal subtotal) {
        BigDecimal price = shippingService.calculate(subtotal != null ? subtotal : BigDecimal.ZERO);
        String desc = price.compareTo(BigDecimal.ZERO) == 0
                ? "Free shipping on orders ₹999+"
                : "Standard shipping ₹99 (free over ₹999)";
        return new MiscDtos.ShippingQuoteResponse(price, desc);
    }
}
