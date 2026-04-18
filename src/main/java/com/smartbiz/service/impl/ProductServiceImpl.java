package com.smartbiz.service.impl;

import com.smartbiz.dto.ProductRequestDto;
import com.smartbiz.dto.ProductResponseDto;
import com.smartbiz.entity.Business;
import com.smartbiz.entity.Product;
import com.smartbiz.entity.Supplier;
import com.smartbiz.entity.User;
import com.smartbiz.repository.ProductRepository;
import com.smartbiz.repository.SupplierRepository;
import com.smartbiz.repository.UserRepository;
import com.smartbiz.security.SecurityUtils;
import com.smartbiz.service.ProductService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;

    public ProductServiceImpl(ProductRepository productRepository,
                              SupplierRepository supplierRepository,
                              UserRepository userRepository) {
        this.productRepository = productRepository;
        this.supplierRepository = supplierRepository;
        this.userRepository = userRepository;
    }

    @Override
    public ProductResponseDto saveProduct(ProductRequestDto request) {
        User loggedInUser = getLoggedInUser();
        Business business = loggedInUser.getBusiness();

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));

            if (!supplier.getBusiness().getId().equals(business.getId())) {
                throw new RuntimeException("Access denied");
            }
        }

        Product product = Product.builder()
                .productName(request.getProductName())
                .category(request.getCategory())
                .description(request.getDescription())
                .unitPrice(request.getUnitPrice())
                .stockQuantity(request.getStockQuantity())
                .business(business)
                .supplier(supplier)
                .build();

        Product saved = productRepository.save(product);
        return mapToDto(saved);
    }

    @Override
    public List<ProductResponseDto> getAllProducts() {
        User loggedInUser = getLoggedInUser();
        Long businessId = loggedInUser.getBusiness().getId();

        return productRepository.findByBusinessId(businessId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public ProductResponseDto getProductById(Long id) {
        User loggedInUser = getLoggedInUser();
        Long businessId = loggedInUser.getBusiness().getId();

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getBusiness().getId().equals(businessId)) {
            throw new RuntimeException("Access denied");
        }

        return mapToDto(product);
    }

    @Override
    public ProductResponseDto updateProduct(Long id, ProductRequestDto request) {
        User loggedInUser = getLoggedInUser();
        Business business = loggedInUser.getBusiness();
        Long businessId = business.getId();

        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!existing.getBusiness().getId().equals(businessId)) {
            throw new RuntimeException("Access denied");
        }

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));

            if (!supplier.getBusiness().getId().equals(businessId)) {
                throw new RuntimeException("Access denied");
            }
        }

        existing.setProductName(request.getProductName());
        existing.setCategory(request.getCategory());
        existing.setDescription(request.getDescription());
        existing.setUnitPrice(request.getUnitPrice());
        existing.setStockQuantity(request.getStockQuantity());
        existing.setSupplier(supplier);

        Product updated = productRepository.save(existing);
        return mapToDto(updated);
    }

    @Override
    public void deleteProduct(Long id) {
        User loggedInUser = getLoggedInUser();
        Long businessId = loggedInUser.getBusiness().getId();

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getBusiness().getId().equals(businessId)) {
            throw new RuntimeException("Access denied");
        }

        productRepository.deleteById(id);
    }

    private User getLoggedInUser() {
        String email = SecurityUtils.getCurrentUserEmail();

        if (email == null) {
            throw new RuntimeException("No authenticated user found");
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Logged-in user not found"));
    }

    private ProductResponseDto mapToDto(Product product) {
        return ProductResponseDto.builder()
                .id(product.getId())
                .productName(product.getProductName())
                .category(product.getCategory())
                .description(product.getDescription())
                .unitPrice(product.getUnitPrice())
                .stockQuantity(product.getStockQuantity())
                .businessId(product.getBusiness().getId())
                .supplierId(product.getSupplier() != null ? product.getSupplier().getId() : null)
                .build();
    }
}