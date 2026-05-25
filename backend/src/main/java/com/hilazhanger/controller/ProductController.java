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
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return productService.list(search, page, size);
    }

    @GetMapping("/slug/{slug}")
    public ProductDtos.ProductDto bySlug(@PathVariable String slug) {
        return productService.getBySlug(slug);
    }

    @GetMapping("/{id}")
    public ProductDtos.ProductDto byId(@PathVariable UUID id) {
        return productService.getById(id);
    }

    @PostMapping
    public ProductDtos.ProductDto create(@Valid @RequestBody ProductDtos.CreateProductRequest request) {
        return productService.create(request);
    }

    @PutMapping("/{id}")
    public ProductDtos.ProductDto update(@PathVariable UUID id, @Valid @RequestBody ProductDtos.UpdateProductRequest request) {
        return productService.update(id, request);
    }
}
