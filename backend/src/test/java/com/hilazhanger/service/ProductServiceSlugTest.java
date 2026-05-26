package com.hilazhanger.service;

import com.hilazhanger.domain.entity.Product;
import com.hilazhanger.repository.CategoryRepository;
import com.hilazhanger.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceSlugTest {

    @Mock
    ProductRepository productRepository;

    @Mock
    CategoryRepository categoryRepository;

    @InjectMocks
    ProductService productService;

    @Test
    void getBySlug_delegatesToGetById() {
        UUID id = UUID.randomUUID();
        String slug = "test-product-slug";
        Product product = Product.builder()
                .id(id)
                .name("Test")
                .slug(slug)
                .price(BigDecimal.valueOf(100))
                .build();

        when(productRepository.findIdBySlug(slug)).thenReturn(Optional.of(id));
        when(productRepository.findById(id)).thenReturn(Optional.of(product));

        var dto = productService.getBySlug(slug);

        assertThat(dto.slug()).isEqualTo(slug);
        assertThat(dto.id()).isEqualTo(id);
    }
}
