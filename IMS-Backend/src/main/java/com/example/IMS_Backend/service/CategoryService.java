package com.example.IMS_Backend.service;

import com.example.IMS_Backend.category.Category;
import com.example.IMS_Backend.dto.CategoryResponse;
import com.example.IMS_Backend.dto.CreateCategoryRequest;
import com.example.IMS_Backend.exception.AppExceptions.*;
import com.example.IMS_Backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepo;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepo.findByIsActiveTrue().stream().map(this::toResponse).toList();
    }

    public CategoryResponse createCategory(CreateCategoryRequest req) {
        Category parent = null;
        if (req.getParentId() != null) {
            parent = categoryRepo.findById(req.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category not found"));
        }
        return toResponse(categoryRepo.save(Category.builder()
                .categoryName(req.getCategoryName()).parent(parent).isActive(true).build()));
    }

    private CategoryResponse toResponse(Category c) {
        return CategoryResponse.builder()
                .id(c.getId()).categoryName(c.getCategoryName())
                .parentId(c.getParent() != null ? c.getParent().getId() : null)
                .parentName(c.getParent() != null ? c.getParent().getCategoryName() : null)
                .isActive(c.getIsActive()).build();
    }
}
