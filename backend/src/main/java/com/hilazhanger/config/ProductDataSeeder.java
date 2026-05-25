package com.hilazhanger.config;

import com.hilazhanger.domain.entity.Product;
import com.hilazhanger.domain.entity.ProductImage;
import com.hilazhanger.domain.entity.ProductVariant;
import com.hilazhanger.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;

@Configuration
public class ProductDataSeeder {

    @Bean
    CommandLineRunner seedProducts(ProductRepository productRepository) {
        return args -> {
            if (productRepository.count() > 0) return;

            seedProduct(productRepository,
                    "Urban Ease Mulmul Set", "urban-ease-mulmul-set",
                    "Premium Mulmul Cotton Set with oversized shirt and relaxed pants.",
                    "Premium Mulmul Cotton", "Butter Yellow / Pastel Blue",
                    new BigDecimal("999"), new BigDecimal("1499"),
                    new String[]{"BESTSELLER"}, new String[]{"M", "L", "XL", "XXL"},
                    "https://images.unsplash.com/photo-1595777457583-95e059fdfcdc?w=800",
                    new Object[][]{{"Pastel Blue", "#A8D4E6", "L", 12}, {"Butter Yellow", "#F5E6A8", "M", 12}});

            seedProduct(productRepository,
                    "High-Waist Denim Slit Skirt", "high-waist-denim-slit-skirt",
                    "Classic high-waist denim with front slit.",
                    "Stretch Denim", "Indigo Blue",
                    new BigDecimal("499"), new BigDecimal("799"),
                    new String[]{"NEW ARRIVAL"}, new String[]{"S", "M", "L", "XL"},
                    "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800",
                    new Object[][]{{null, null, "M", 8}});

            seedProduct(productRepository,
                    "Sage Paperbag Wide-Leg Trousers", "sage-paperbag-trousers",
                    "Relaxed paperbag waist trousers in sage green.",
                    "Cotton Blend", "Sage Green",
                    new BigDecimal("899"), null,
                    new String[]{"TRENDING"}, new String[]{"S", "M", "L"},
                    "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800",
                    new Object[][]{{null, null, "L", 40}});
        };
    }

    private void seedProduct(ProductRepository repo, String name, String slug, String desc,
                             String fabric, String colorInfo, BigDecimal price, BigDecimal compare,
                             String[] labels, String[] sizes, String imageUrl, Object[][] variants) {
        Product p = Product.builder()
                .name(name).slug(slug).description(desc).fabric(fabric).colorInfo(colorInfo)
                .brand("Hilaz Hanger").price(price).compareAtPrice(compare)
                .active(true).labels(labels).sizes(sizes).colors("[]")
                .build();
        ProductImage img = ProductImage.builder().product(p).url(imageUrl).sortOrder(0).primaryImage(true).build();
        p.getImages().add(img);
        for (Object[] v : variants) {
            p.getVariants().add(ProductVariant.builder()
                    .product(p)
                    .colorName((String) v[0])
                    .colorHex((String) v[1])
                    .size((String) v[2])
                    .stockQuantity((Integer) v[3])
                    .build());
        }
        repo.save(p);
    }
}
