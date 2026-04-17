package com.smartbiz.service.impl;

import com.smartbiz.dto.ProductRequestDto;
import com.smartbiz.dto.ProductResponseDto;
import com.smartbiz.entity.Business;
import com.smartbiz.entity.Product;
import com.smartbiz.entity.Supplier;
import com.smartbiz.repository.BusinessRepository;
import com.smartbiz.repository.ProductRepository;
import com.smartbiz.repository.SupplierRepository;
import com.smartbiz.service.ProductService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final BusinessRepository businessRepository;
    private final SupplierRepository supplierRepository;

    public ProductServiceImpl(ProductRepository productRepository,
                              BusinessRepository businessRepository,
                              SupplierRepository supplierRepository) {
        this.productRepository = productRepository;
        this.businessRepository = businessRepository;
        this.supplierRepository = supplierRepository;
    }

    @Override
    public ProductResponseDto saveProduct(ProductRequestDto request) {
        Business business = businessRepository.findById(request.getBusinessId())
                .orElseThrow(() -> new RuntimeException("Business not found"));

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));
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
        return productRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public ProductResponseDto getProductById(Long id) {
        Product product = productRepository.findById(id).orElse(null);
        return product == null ? null : mapToDto(product);
    }

    @Override
    public ProductResponseDto updateProduct(Long id, ProductRequestDto request) {
        Product existing = productRepository.findById(id).orElse(null);

        if (existing == null) {
            return null;
        }

        Business business = businessRepository.findById(request.getBusinessId())
                .orElseThrow(() -> new RuntimeException("Business not found"));

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));
        }

        existing.setProductName(request.getProductName());
        existing.setCategory(request.getCategory());
        existing.setDescription(request.getDescription());
        existing.setUnitPrice(request.getUnitPrice());
        existing.setStockQuantity(request.getStockQuantity());
        existing.setBusiness(business);
        existing.setSupplier(supplier);

        Product updated = productRepository.save(existing);
        return mapToDto(updated);
    }

    @Override
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
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