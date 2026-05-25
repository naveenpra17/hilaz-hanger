package com.hilazhanger.controller;

import com.hilazhanger.domain.entity.Category;
import com.hilazhanger.repository.CategoryRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public List<CategoryDto> list() {
        return categoryRepository.findByActiveTrueOrderBySortOrderAsc().stream()
                .map(c -> new CategoryDto(c.getId(), c.getName(), c.getSlug(), c.getImageUrl()))
                .toList();
    }

    public record CategoryDto(java.util.UUID id, String name, String slug, String imageUrl) {}
}
