package com.hilazhanger.service;

import com.hilazhanger.domain.entity.Category;
import com.hilazhanger.dto.CategoryDtos;
import com.hilazhanger.repository.CategoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryDtos.CategoryDto> listPublic() {
        return categoryRepository.findByActiveTrueOrderBySortOrderAsc().stream()
                .map(this::toDto).toList();
    }

    public List<CategoryDtos.CategoryDto> listAll() {
        return categoryRepository.findAll().stream()
                .sorted((a, b) -> Integer.compare(a.getSortOrder(), b.getSortOrder()))
                .map(this::toDto).toList();
    }

    @Transactional
    public CategoryDtos.CategoryDto create(CategoryDtos.CategoryRequest req) {
        if (categoryRepository.existsBySlug(req.slug())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Slug already exists");
        }
        Category category = Category.builder()
                .name(req.name())
                .slug(req.slug())
                .description(req.description())
                .imageUrl(req.imageUrl())
                .sortOrder(req.sortOrder())
                .active(req.active())
                .build();
        return toDto(categoryRepository.save(category));
    }

    @Transactional
    public CategoryDtos.CategoryDto update(UUID id, CategoryDtos.CategoryRequest req) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        categoryRepository.findBySlug(req.slug()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Slug already exists");
            }
        });
        category.setName(req.name());
        category.setSlug(req.slug());
        category.setDescription(req.description());
        category.setImageUrl(req.imageUrl());
        category.setSortOrder(req.sortOrder());
        category.setActive(req.active());
        return toDto(categoryRepository.save(category));
    }

    @Transactional
    public void delete(UUID id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        categoryRepository.deleteById(id);
    }

    private CategoryDtos.CategoryDto toDto(Category c) {
        return new CategoryDtos.CategoryDto(
                c.getId(), c.getName(), c.getSlug(), c.getDescription(),
                c.getImageUrl(), c.getSortOrder(), c.isActive());
    }
}
