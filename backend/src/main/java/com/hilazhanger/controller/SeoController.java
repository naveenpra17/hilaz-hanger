package com.hilazhanger.controller;

import com.hilazhanger.domain.entity.Product;
import com.hilazhanger.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.format.DateTimeFormatter;

@RestController
public class SeoController {

    private final ProductRepository productRepository;
    private final String siteUrl;

    public SeoController(
            ProductRepository productRepository,
            @Value("${app.frontend.url:https://hilaz-hanger.vercel.app}") String siteUrl
    ) {
        this.productRepository = productRepository;
        this.siteUrl = siteUrl.endsWith("/") ? siteUrl.substring(0, siteUrl.length() - 1) : siteUrl;
    }

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public String sitemap() {
        String lastmod = DateTimeFormatter.ISO_INSTANT.format(Instant.now());
        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");
        appendUrl(xml, siteUrl + "/", "daily", "1.0", lastmod);
        appendUrl(xml, siteUrl + "/shop", "daily", "0.9", lastmod);
        appendUrl(xml, siteUrl + "/contact", "monthly", "0.5", lastmod);
        for (Product p : productRepository.findByActiveTrue()) {
            appendUrl(xml, siteUrl + "/product/" + p.getSlug(), "weekly", "0.8", lastmod);
        }
        xml.append("</urlset>");
        return xml.toString();
    }

    private void appendUrl(StringBuilder xml, String loc, String changefreq, String priority, String lastmod) {
        xml.append("  <url><loc>").append(escape(loc)).append("</loc>");
        xml.append("<lastmod>").append(lastmod).append("</lastmod>");
        xml.append("<changefreq>").append(changefreq).append("</changefreq>");
        xml.append("<priority>").append(priority).append("</priority></url>\n");
    }

    private String escape(String s) {
        return s.replace("&", "&amp;").replace("<", "&lt;");
    }
}
