package com.smartbiz.service.impl;

import com.smartbiz.dto.SaleItemRequestDto;
import com.smartbiz.dto.SaleItemResponseDto;
import com.smartbiz.entity.Product;
import com.smartbiz.entity.Sale;
import com.smartbiz.entity.SaleItem;
import com.smartbiz.entity.User;
import com.smartbiz.exception.AccessDeniedException;
import com.smartbiz.exception.BadRequestException;
import com.smartbiz.exception.ResourceNotFoundException;
import com.smartbiz.repository.ProductRepository;
import com.smartbiz.repository.SaleItemRepository;
import com.smartbiz.repository.SaleRepository;
import com.smartbiz.repository.UserRepository;
import com.smartbiz.service.SaleItemService;
import com.smartbiz.util.SecurityHelper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class SaleItemServiceImpl implements SaleItemService {

    private final SaleItemRepository saleItemRepository;
    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public SaleItemServiceImpl(SaleItemRepository saleItemRepository,
                               SaleRepository saleRepository,
                               ProductRepository productRepository,
                               UserRepository userRepository) {
        this.saleItemRepository = saleItemRepository;
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Override
    public SaleItemResponseDto saveSaleItem(SaleItemRequestDto request) {
        User loggedInUser = SecurityHelper.getLoggedInUser(userRepository);
        Long businessId = loggedInUser.getBusiness().getId();

        Sale sale = saleRepository.findById(request.getSaleId())
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!sale.getBusiness().getId().equals(businessId) || !product.getBusiness().getId().equals(businessId)) {
            throw new AccessDeniedException("Access denied");
        }

        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new BadRequestException("Quantity must be greater than 0");
        }

        if (product.getUnitPrice() == null) {
            throw new BadRequestException("Product unit price is missing");
        }

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
        User loggedInUser = SecurityHelper.getLoggedInUser(userRepository);
        Long businessId = loggedInUser.getBusiness().getId();

        return saleItemRepository.findBySaleBusinessId(businessId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public SaleItemResponseDto getSaleItemById(Long id) {
        User loggedInUser = SecurityHelper.getLoggedInUser(userRepository);
        Long businessId = loggedInUser.getBusiness().getId();

        SaleItem saleItem = saleItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale item not found"));

        if (!saleItem.getSale().getBusiness().getId().equals(businessId)) {
            throw new AccessDeniedException("Access denied");
        }

        return mapToDto(saleItem);
    }

    @Override
    public SaleItemResponseDto updateSaleItem(Long id, SaleItemRequestDto request) {
        User loggedInUser = SecurityHelper.getLoggedInUser(userRepository);
        Long businessId = loggedInUser.getBusiness().getId();

        SaleItem existing = saleItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale item not found"));

        if (!existing.getSale().getBusiness().getId().equals(businessId)) {
            throw new AccessDeniedException("Access denied");
        }

        Sale sale = saleRepository.findById(request.getSaleId())
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!sale.getBusiness().getId().equals(businessId) || !product.getBusiness().getId().equals(businessId)) {
            throw new AccessDeniedException("Access denied");
        }

        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new BadRequestException("Quantity must be greater than 0");
        }

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
        User loggedInUser = SecurityHelper.getLoggedInUser(userRepository);
        Long businessId = loggedInUser.getBusiness().getId();

        SaleItem saleItem = saleItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale item not found"));

        if (!saleItem.getSale().getBusiness().getId().equals(businessId)) {
            throw new AccessDeniedException("Access denied");
        }

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