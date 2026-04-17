package com.smartbiz.service.impl;

import com.smartbiz.dto.SaleItemRequestDto;
import com.smartbiz.dto.SaleItemResponseDto;
import com.smartbiz.entity.Product;
import com.smartbiz.entity.Sale;
import com.smartbiz.entity.SaleItem;
import com.smartbiz.repository.ProductRepository;
import com.smartbiz.repository.SaleItemRepository;
import com.smartbiz.repository.SaleRepository;
import com.smartbiz.service.SaleItemService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class SaleItemServiceImpl implements SaleItemService {

    private final SaleItemRepository saleItemRepository;
    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;

    public SaleItemServiceImpl(SaleItemRepository saleItemRepository,
                               SaleRepository saleRepository,
                               ProductRepository productRepository) {
        this.saleItemRepository = saleItemRepository;
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
    }

    @Override
    public SaleItemResponseDto saveSaleItem(SaleItemRequestDto request) {
        Sale sale = saleRepository.findById(request.getSaleId())
                .orElseThrow(() -> new RuntimeException("Sale not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        BigDecimal unitPrice = product.getUnitPrice();
        BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(request.getQuantity()));

        SaleItem saleItem = SaleItem.builder()
                .quantity(request.getQuantity())
                .unitPrice(unitPrice)
                .subtotal(subtotal)
                .sale(sale)
                .product(product)
                .build();

        SaleItem saved = saleItemRepository.save(saleItem);
        return mapToDto(saved);
    }

    @Override
    public List<SaleItemResponseDto> getAllSaleItems() {
        return saleItemRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public SaleItemResponseDto getSaleItemById(Long id) {
        SaleItem saleItem = saleItemRepository.findById(id).orElse(null);
        return saleItem == null ? null : mapToDto(saleItem);
    }

    @Override
    public SaleItemResponseDto updateSaleItem(Long id, SaleItemRequestDto request) {
        SaleItem existing = saleItemRepository.findById(id).orElse(null);

        if (existing == null) {
            return null;
        }

        Sale sale = saleRepository.findById(request.getSaleId())
                .orElseThrow(() -> new RuntimeException("Sale not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        BigDecimal unitPrice = product.getUnitPrice();
        BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(request.getQuantity()));

        existing.setQuantity(request.getQuantity());
        existing.setUnitPrice(unitPrice);
        existing.setSubtotal(subtotal);
        existing.setSale(sale);
        existing.setProduct(product);

        SaleItem updated = saleItemRepository.save(existing);
        return mapToDto(updated);
    }

    @Override
    public void deleteSaleItem(Long id) {
        saleItemRepository.deleteById(id);
    }

    private SaleItemResponseDto mapToDto(SaleItem saleItem) {
        return SaleItemResponseDto.builder()
                .id(saleItem.getId())
                .quantity(saleItem.getQuantity())
                .unitPrice(saleItem.getUnitPrice())
                .subtotal(saleItem.getSubtotal())
                .saleId(saleItem.getSale().getId())
                .productId(saleItem.getProduct().getId())
                .build();
    }
}