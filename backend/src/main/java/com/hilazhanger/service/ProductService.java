package com.hilazhanger.service;

import com.hilazhanger.domain.entity.Product;
import com.hilazhanger.domain.entity.ProductImage;
import com.hilazhanger.dto.ProductDtos;
import com.hilazhanger.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public ProductDtos.ProductPageDto list(String search, int page, int size) {
        Page<Product> result = productRepository.search(
                blankToNull(search),
                null,
                PageRequest.of(page, size)
        );
        return new ProductDtos.ProductPageDto(
                result.getContent().stream().map(this::toDto).toList(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.getNumber(),
                result.getSize()
        );
    }

    @Transactional(readOnly = true)
    public ProductDtos.ProductDto getBySlug(String slug) {
        return productRepository.findBySlug(slug)
                .map(this::toDto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public ProductDtos.ProductDto getById(UUID id) {
        return productRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @Transactional
    public ProductDtos.ProductDto create(ProductDtos.CreateProductRequest req) {
        Product product = Product.builder()
                .name(req.name())
                .brand(req.brand() != null ? req.brand() : "Hilaz Hanger")
                .slug(req.slug())
                .description(req.description())
                .fabric(req.fabric())
                .colorInfo(req.colorInfo())
                .price(req.price())
                .compareAtPrice(req.compareAtPrice())
                .active(req.active())
                .expressShipping(req.expressShipping())
                .labels(req.labels() != null ? req.labels().toArray(new String[0]) : new String[0])
                .sizes(req.sizes() != null ? req.sizes().toArray(new String[0]) : new String[0])
                .build();
        if (req.images() != null) {
            int i = 0;
            for (ProductDtos.ProductImageDto img : req.images()) {
                ProductImage pi = ProductImage.builder()
                        .product(product)
                        .url(img.url())
                        .cloudinaryPublicId(img.publicId())
                        .sortOrder(i++)
                        .primaryImage(img.isPrimary())
                        .build();
                product.getImages().add(pi);
            }
        }
        return toDto(productRepository.save(product));
    }

    @Transactional
    public ProductDtos.ProductDto update(UUID id, ProductDtos.UpdateProductRequest req) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        product.setName(req.name());
        product.setBrand(req.brand() != null ? req.brand() : "Hilaz Hanger");
        product.setSlug(req.slug());
        product.setDescription(req.description());
        product.setFabric(req.fabric());
        product.setColorInfo(req.colorInfo());
        product.setPrice(req.price());
        product.setCompareAtPrice(req.compareAtPrice());
        product.setActive(req.active());
        product.setExpressShipping(req.expressShipping());
        product.setLabels(req.labels() != null ? req.labels().toArray(new String[0]) : new String[0]);
        product.setSizes(req.sizes() != null ? req.sizes().toArray(new String[0]) : new String[0]);
        if (req.images() != null && !req.images().isEmpty()) {
            product.getImages().clear();
            int i = 0;
            for (ProductDtos.ProductImageDto img : req.images()) {
                product.getImages().add(ProductImage.builder()
                        .product(product)
                        .url(img.url())
                        .cloudinaryPublicId(img.publicId())
                        .sortOrder(i++)
                        .primaryImage(img.isPrimary())
                        .build());
            }
        }
        return toDto(productRepository.save(product));
    }

    private ProductDtos.ProductDto toDto(Product p) {
        int totalStock = p.getVariants().stream().mapToInt(v -> v.getStockQuantity()).sum();
        return new ProductDtos.ProductDto(
                p.getId(),
                p.getName(),
                p.getBrand(),
                p.getSlug(),
                p.getDescription(),
                p.getFabric(),
                p.getColorInfo(),
                p.getPrice(),
                p.getCompareAtPrice(),
                p.isActive(),
                p.isExpressShipping(),
                p.getLabels() != null ? Arrays.asList(p.getLabels()) : List.of(),
                p.getSizes() != null ? Arrays.asList(p.getSizes()) : List.of(),
                p.getColors(),
                p.getImages().stream()
                        .map(img -> new ProductDtos.ProductImageDto(img.getId(), img.getUrl(), img.getSortOrder(), img.isPrimaryImage()))
                        .toList(),
                p.getVariants().stream()
                        .map(v -> new ProductDtos.ProductVariantDto(v.getId(), v.getColorName(), v.getColorHex(), v.getSize(), v.getStockQuantity()))
                        .toList(),
                totalStock
        );
    }

    private String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s;
    }
}
