package com.hilazhanger.config;

import com.hilazhanger.domain.entity.Category;
import com.hilazhanger.domain.entity.Product;
import com.hilazhanger.domain.entity.ProductImage;
import com.hilazhanger.domain.entity.ProductVariant;
import com.hilazhanger.repository.CategoryRepository;
import com.hilazhanger.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Configuration
public class ProductDataSeeder {

    private static final Logger log = LoggerFactory.getLogger(ProductDataSeeder.class);
    private static final Path SOURCE_FILE = resolveSourceFile();
    private static final BigDecimal DEFAULT_PRICE = new BigDecimal("999");
    private static final List<String> DEFAULT_SIZES = List.of("S", "M", "L", "XL");
    @Value("${app.seed.replace-products-from-file:false}")
    private boolean replaceProductsFromFile;

    @Bean
    CommandLineRunner seedProducts(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            JdbcTemplate jdbcTemplate
    ) {
        return args -> importFromFile(productRepository, categoryRepository, jdbcTemplate);
    }

    @Transactional
    void importFromFile(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            JdbcTemplate jdbcTemplate
    ) throws Exception {
        if (!replaceProductsFromFile) {
            log.info("Skipping catalog import (app.seed.replace-products-from-file=false)");
            return;
        }
        if (!Files.exists(SOURCE_FILE)) {
            log.warn("Skipping catalog import: {} not found", SOURCE_FILE.toAbsolutePath());
            return;
        }

        Map<String, List<ImageRow>> grouped = parseSource(Files.readAllLines(SOURCE_FILE));
        if (grouped.isEmpty()) {
            log.warn("Skipping catalog import: {} is empty", SOURCE_FILE.toAbsolutePath());
            return;
        }

        clearExistingData(jdbcTemplate);

        Map<String, Category> categories = new LinkedHashMap<>();
        for (Category c : categoryRepository.findAll()) {
            categories.put(c.getSlug(), c);
        }

        int imported = 0;
        for (Map.Entry<String, List<ImageRow>> entry : grouped.entrySet()) {
            Product product = buildProduct(entry.getKey(), entry.getValue(), categories);
            productRepository.save(product);
            imported++;
        }
        log.info("Imported {} products from {}", imported, SOURCE_FILE.toAbsolutePath());
    }

    private static void clearExistingData(JdbcTemplate jdbcTemplate) {
        // Clear catalog and dependent product-linked records only.
        jdbcTemplate.update("UPDATE order_items SET product_id = NULL, variant_id = NULL");
        jdbcTemplate.update("DELETE FROM reviews");
        jdbcTemplate.update("DELETE FROM wishlists");
        jdbcTemplate.update("DELETE FROM cart_items");
        jdbcTemplate.update("DELETE FROM carts");
        jdbcTemplate.update("DELETE FROM product_images");
        jdbcTemplate.update("DELETE FROM product_variants");
        jdbcTemplate.update("DELETE FROM products");
    }

    private static Map<String, List<ImageRow>> parseSource(List<String> lines) {
        Map<String, List<ImageRow>> grouped = new LinkedHashMap<>();
        for (String raw : lines) {
            if (raw == null || raw.isBlank()) continue;
            String[] parts = raw.split("\\s*\\|\\s*", 3);
            if (parts.length < 3) continue;
            String name = cleanName(parts[0]);
            String label = parts[1].trim();
            String url = parts[2].trim();
            if (name.isBlank() || url.isBlank()) continue;
            grouped.computeIfAbsent(name, k -> new ArrayList<>())
                    .add(new ImageRow(label, url));
        }
        return grouped;
    }

    private static Product buildProduct(
            String name,
            List<ImageRow> images,
            Map<String, Category> categories
    ) {
        String slug = slugify(name);
        String categorySlug = guessCategory(name);
        Category category = categories.get(categorySlug);

        Product product = Product.builder()
                .name(name)
                .slug(slug)
                .description(name + " from HILAZ HANGER premium collection.")
                .fabric("Premium Blend")
                .colorInfo("Multi")
                .brand("HILAZ HANGER")
                .price(DEFAULT_PRICE)
                .compareAtPrice(null)
                .categoryId(category != null ? category.getId() : null)
                .active(true)
                .labels(List.of("NEW ARRIVAL"))
                .sizes(DEFAULT_SIZES)
                .colors("[]")
                .build();

        int sort = 0;
        boolean hasPrimary = false;
        for (ImageRow row : images) {
            boolean primary = row.label.toLowerCase(Locale.ROOT).contains("main") && !hasPrimary;
            if (primary) hasPrimary = true;
            product.getImages().add(ProductImage.builder()
                    .product(product)
                    .url(row.url)
                    .sortOrder(sort++)
                    .primaryImage(primary)
                    .build());
        }
        if (!hasPrimary && !product.getImages().isEmpty()) {
            product.getImages().get(0).setPrimaryImage(true);
        }

        // Minimal stock model so checkout works immediately.
        for (String size : DEFAULT_SIZES) {
            product.getVariants().add(ProductVariant.builder()
                    .product(product)
                    .colorName("Default")
                    .colorHex("#8B2942")
                    .size(size)
                    .stockQuantity(20)
                    .build());
        }
        return product;
    }

    private static String guessCategory(String name) {
        String n = name.toLowerCase(Locale.ROOT);
        if (n.contains("dress") || n.contains("jumpsuit") || n.contains("pinafore")) return "dresses";
        if (n.contains("skirt") || n.contains("pant") || n.contains("trouser") || n.contains("culotte") || n.contains("short")) return "bottoms";
        if (n.contains("set") || n.contains("co-ord") || n.contains("coord")) return "sets";
        return "tops";
    }

    private static String cleanName(String value) {
        return value.replace("\u200B", "").trim();
    }

    private static String slugify(String name) {
        return cleanName(name)
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-+|-+$)", "");
    }

    private static Path resolveSourceFile() {
        Path local = Path.of("product_links_separated.txt");
        if (Files.exists(local)) return local;
        Path parent = Path.of("..", "product_links_separated.txt");
        if (Files.exists(parent)) return parent;
        return local;
    }

    private record ImageRow(String label, String url) {}
}
