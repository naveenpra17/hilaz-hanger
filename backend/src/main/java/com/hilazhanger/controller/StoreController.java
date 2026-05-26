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
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;

@RestController
public class StoreController {

    private static final Logger log = LoggerFactory.getLogger(StoreController.class);

    private final NewsletterSubscriberRepository newsletterRepository;
    private final NotificationService notificationService;
    private final ShippingService shippingService;

    @Value("${app.mail.from:noreply@hilazhanger.com}")
    private String mailFrom;

    @Value("${app.store.name:HILAZ HANGER}")
    private String storeName;

    @Value("${app.store.phone:+916383799574}")
    private String storePhone;

    @Value("${app.store.email:hello@hilazhanger.com}")
    private String storeEmail;

    @Value("${app.store.whatsapp:+916383799574}")
    private String whatsappNumber;

    @Value("${app.store.instagram:https://www.instagram.com/thehilaz.hanger}")
    private String instagramUrl;

    @Value("${app.store.address:338, Kalaingar Nagar, Chettipalayam, Coimbatore – 641201, Tamil Nadu, India}")
    private String storeAddress;

    public StoreController(NewsletterSubscriberRepository newsletterRepository,
                           NotificationService notificationService,
                           ShippingService shippingService) {
        this.newsletterRepository = newsletterRepository;
        this.notificationService = notificationService;
        this.shippingService = shippingService;
    }

    @PostMapping("/contact")
    public MiscDtos.ContactResponse contact(@Valid @RequestBody MiscDtos.ContactRequest request) {
        if (request.website() != null && !request.website().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid submission");
        }
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

    @GetMapping("/store/config")
    public MiscDtos.StoreConfigResponse storeConfig() {
        return new MiscDtos.StoreConfigResponse(
                storeName,
                storePhone,
                storeEmail,
                whatsappNumber,
                "Hi Hilaz Hanger! I have a question about my order.",
                instagramUrl,
                storeAddress
        );
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
