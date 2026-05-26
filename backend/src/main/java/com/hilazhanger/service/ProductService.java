package com.hilazhanger.service;

import com.hilazhanger.domain.entity.Product;
import com.hilazhanger.domain.entity.ProductImage;
import com.hilazhanger.domain.entity.ProductVariant;
import com.hilazhanger.dto.ProductDtos;
import com.hilazhanger.repository.CategoryRepository;
import com.hilazhanger.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public ProductDtos.ProductPageDto list(String search, String categorySlug, String filter, String sort, int page, int size) {
        Sort sortSpec = resolveSort(sort);
        Pageable pageable = sortSpec != null ? PageRequest.of(page, size, sortSpec) : PageRequest.of(page, size);
        String term = blankToNull(search);
        UUID categoryId = resolveCategoryId(categorySlug);
        Page<Product> result;
        if (term != null) {
            result = productRepository.searchByTerm(term, pageable);
        } else if (categoryId != null) {
            result = productRepository.findByCategoryIdAndActiveTrue(categoryId, pageable);
        } else if ("low-stock".equals(filter)) {
            result = productRepository.findLowStock(pageable);
        } else if ("out-of-stock".equals(filter)) {
            result = productRepository.findOutOfStock(pageable);
        } else if ("inactive".equals(filter)) {
            result = productRepository.findByActiveFalse(pageable);
        } else if ("active".equals(filter)) {
            result = productRepository.findByActiveTrue(pageable);
        } else {
            result = productRepository.findByActiveTrue(pageable);
        }
        List<UUID> ids = result.getContent().stream().map(Product::getId).toList();
        Map<UUID, Product> loaded = ids.isEmpty()
                ? Map.of()
                : productRepository.findAllByIdIn(ids).stream()
                        .peek(p -> {
                            p.getImages().size();
                            p.getVariants().size();
                        })
                        .collect(Collectors.toMap(Product::getId, Function.identity()));
        List<ProductDtos.ProductDto> content = result.getContent().stream()
                .map(p -> toDto(loaded.getOrDefault(p.getId(), p)))
                .toList();
        return new ProductDtos.ProductPageDto(
                content,
                result.getTotalElements(),
                result.getTotalPages(),
                result.getNumber(),
                result.getSize()
        );
    }

    @Transactional(readOnly = true)
    public List<ProductDtos.ProductDto> related(UUID productId, int limit) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (product.getCategoryId() == null) {
            return List.of();
        }
        return productRepository.findRelated(product.getCategoryId(), productId, PageRequest.of(0, limit))
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductDtos.ProductDto getBySlug(String slug) {
        if (slug == null || slug.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product slug is required");
        }
        return productRepository.findBySlug(slug.trim())
                .map(this::toDto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    @Transactional(readOnly = true)
    public ProductDtos.ProductDto getById(UUID id) {
        return productRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @Transactional
    public ProductDtos.ProductDto create(ProductDtos.CreateProductRequest req) {
        String slug = resolveUniqueSlug(req.slug(), null);
        Product product = Product.builder()
                .name(req.name())
                .brand(req.brand() != null ? req.brand() : "Hilaz Hanger")
                .slug(slug)
                .description(req.description())
                .fabric(req.fabric())
                .colorInfo(req.colorInfo())
                .price(req.price())
                .compareAtPrice(req.compareAtPrice())
                .active(req.active())
                .expressShipping(req.expressShipping())
                .labels(req.labels() != null ? req.labels() : List.of())
                .sizes(req.sizes() != null ? req.sizes() : List.of())
                .metaTitle(req.metaTitle())
                .metaDescription(req.metaDescription())
                .build();
        if (req.images() != null) {
            int i = 0;
            for (ProductDtos.ProductImageDto img : req.images()) {
                if (img.url() == null || img.url().isBlank()) {
                    continue;
                }
                ProductImage pi = ProductImage.builder()
                        .product(product)
                        .url(img.url().trim())
                        .cloudinaryPublicId(img.publicId())
                        .sortOrder(i++)
                        .primaryImage(img.isPrimary())
                        .build();
                product.getImages().add(pi);
            }
        }
        applyVariants(product, req.variants(), req.sizes(), req.defaultStockPerSize());
        return toDto(productRepository.save(product));
    }

    @Transactional
    public ProductDtos.ProductDto update(UUID id, ProductDtos.UpdateProductRequest req) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        product.setName(req.name());
        product.setBrand(req.brand() != null ? req.brand() : "Hilaz Hanger");
        product.setSlug(resolveUniqueSlug(req.slug(), id));
        product.setDescription(req.description());
        product.setFabric(req.fabric());
        product.setColorInfo(req.colorInfo());
        product.setPrice(req.price());
        product.setCompareAtPrice(req.compareAtPrice());
        product.setActive(req.active());
        product.setExpressShipping(req.expressShipping());
        product.setLabels(req.labels() != null ? req.labels() : List.of());
        product.setSizes(req.sizes() != null ? req.sizes() : List.of());
        product.setMetaTitle(req.metaTitle());
        product.setMetaDescription(req.metaDescription());
        if (req.images() != null && !req.images().isEmpty()) {
            product.getImages().clear();
            int i = 0;
            for (ProductDtos.ProductImageDto img : req.images()) {
                if (img.url() == null || img.url().isBlank()) {
                    continue;
                }
                product.getImages().add(ProductImage.builder()
                        .product(product)
                        .url(img.url().trim())
                        .cloudinaryPublicId(img.publicId())
                        .sortOrder(i++)
                        .primaryImage(img.isPrimary())
                        .build());
            }
        }
        if (req.variants() != null || (req.sizes() != null && !req.sizes().isEmpty())) {
            applyVariants(product, req.variants(), req.sizes(), req.defaultStockPerSize());
        }
        return toDto(productRepository.save(product));
    }

    @Transactional
    public void delete(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        productRepository.delete(product);
    }

    private void applyVariants(Product product, List<ProductDtos.VariantInput> variants,
                               List<String> sizes, Integer defaultStockPerSize) {
        product.getVariants().clear();
        int defaultStock = defaultStockPerSize != null && defaultStockPerSize > 0 ? defaultStockPerSize : 10;
        if (variants != null && !variants.isEmpty()) {
            for (ProductDtos.VariantInput v : variants) {
                if (v.size() == null || v.size().isBlank()) continue;
                product.getVariants().add(ProductVariant.builder()
                        .product(product)
                        .colorName(v.colorName() != null && !v.colorName().isBlank() ? v.colorName() : "Default")
                        .colorHex(v.colorHex() != null && !v.colorHex().isBlank() ? v.colorHex() : "#8B2942")
                        .size(v.size().trim())
                        .stockQuantity(Math.max(0, v.stockQuantity()))
                        .build());
            }
            return;
        }
        if (sizes != null) {
            for (String size : sizes) {
                if (size == null || size.isBlank()) continue;
                product.getVariants().add(ProductVariant.builder()
                        .product(product)
                        .colorName("Default")
                        .colorHex("#8B2942")
                        .size(size.trim())
                        .stockQuantity(defaultStock)
                        .build());
            }
        }
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
                p.getLabels() != null ? p.getLabels() : List.of(),
                p.getSizes() != null ? p.getSizes() : List.of(),
                p.getColors(),
                p.getImages().stream()
                        .map(img -> new ProductDtos.ProductImageDto(img.getId(), img.getUrl(), img.getSortOrder(), img.isPrimaryImage()))
                        .toList(),
                p.getVariants().stream()
                        .map(v -> new ProductDtos.ProductVariantDto(v.getId(), v.getColorName(), v.getColorHex(), v.getSize(), v.getStockQuantity()))
                        .toList(),
                totalStock,
                p.getMetaTitle(),
                p.getMetaDescription(),
                p.getRatingAvg(),
                p.getReviewCount() != null ? p.getReviewCount() : 0
        );
    }

    private Sort resolveSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        return switch (sort) {
            case "price-asc" -> Sort.by(Sort.Direction.ASC, "price");
            case "price-desc" -> Sort.by(Sort.Direction.DESC, "price");
            case "name" -> Sort.by(Sort.Direction.ASC, "name");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }

    private UUID resolveCategoryId(String categorySlug) {
        if (categorySlug == null || categorySlug.isBlank()) {
            return null;
        }
        return categoryRepository.findBySlug(categorySlug).map(c -> c.getId()).orElse(null);
    }

    private String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s;
    }

    /** Avoid duplicate-key 500 when two products share the same slug (e.g. same product name). */
    private String resolveUniqueSlug(String requestedSlug, UUID excludeProductId) {
        String base = normalizeSlug(requestedSlug);
        if (base.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product slug is required");
        }
        String candidate = base;
        int suffix = 2;
        while (slugTaken(candidate, excludeProductId)) {
            candidate = base + "-" + suffix++;
        }
        return candidate;
    }

    private boolean slugTaken(String slug, UUID excludeProductId) {
        if (excludeProductId == null) {
            return productRepository.existsBySlug(slug);
        }
        return productRepository.existsBySlugAndIdNot(slug, excludeProductId);
    }

    private static String normalizeSlug(String slug) {
        if (slug == null) {
            return "";
        }
        return slug.trim().toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-+|-+$)", "");
    }
}
