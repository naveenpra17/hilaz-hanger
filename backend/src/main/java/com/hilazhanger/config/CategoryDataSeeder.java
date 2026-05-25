package com.hilazhanger.config;

import com.hilazhanger.domain.entity.Category;
import com.hilazhanger.repository.CategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CategoryDataSeeder {

    @Bean
    CommandLineRunner seedCategories(CategoryRepository categoryRepository) {
        return args -> {
            if (categoryRepository.count() > 0) return;
            String[][] data = {
                    {"Dresses", "dresses", "https://images.unsplash.com/photo-1595777457583-95e059fdfcdc?w=400"},
                    {"Tops", "tops", "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400"},
                    {"Bottoms", "bottoms", "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400"},
                    {"Sets", "sets", "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400"},
            };
            int order = 0;
            for (String[] row : data) {
                categoryRepository.save(Category.builder()
                        .name(row[0])
                        .slug(row[1])
                        .imageUrl(row[2])
                        .sortOrder(order++)
                        .active(true)
                        .build());
            }
        };
    }
}
