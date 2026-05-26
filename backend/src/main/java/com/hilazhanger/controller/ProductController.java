package com.hilazhanger.controller;

import com.hilazhanger.dto.ProductDtos;
import com.hilazhanger.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ProductDtos.ProductPageDto list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String filter,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return productService.list(search, category, filter, sort, page, size);
    }

    @GetMapping("/by-slug")
    public ProductDtos.ProductDto bySlugQuery(@RequestParam("slug") String slug) {
        return productService.getBySlug(slug);
    }

    @GetMapping("/slug/{slug}")
    public ProductDtos.ProductDto bySlugPath(@PathVariable String slug) {
        return productService.getBySlug(slug);
    }

    @GetMapping("/{id}/related")
    public java.util.List<ProductDtos.ProductDto> related(
            @PathVariable String id,
            @RequestParam(defaultValue = "4") int limit
    ) {
        return productService.related(parseProductId(id), limit);
    }

    @GetMapping("/{id}")
    public ProductDtos.ProductDto byId(@PathVariable String id) {
        return productService.getById(parseProductId(id));
    }

    private static UUID parseProductId(String id) {
        try {
            return UUID.fromString(id);
        } catch (IllegalArgumentException e) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND, "Product not found");
        }
    }

    @PostMapping
    public ProductDtos.ProductDto create(@Valid @RequestBody ProductDtos.CreateProductRequest request) {
        return productService.create(request);
    }

    @PutMapping("/{id}")
    public ProductDtos.ProductDto update(@PathVariable UUID id, @Valid @RequestBody ProductDtos.UpdateProductRequest request) {
        return productService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        productService.delete(id);
    }
}
