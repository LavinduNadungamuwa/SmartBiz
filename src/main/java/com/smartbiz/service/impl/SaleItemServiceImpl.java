package com.smartbiz.service.impl;

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
    public SaleItem saveSaleItem(SaleItem saleItem) {
        if (saleItem.getSale() == null || saleItem.getSale().getId() == null) {
            throw new RuntimeException("Sale ID is missing");
        }

        if (saleItem.getProduct() == null || saleItem.getProduct().getId() == null) {
            throw new RuntimeException("Product ID is missing");
        }

        if (saleItem.getQuantity() == null || saleItem.getQuantity() <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        Long saleId = saleItem.getSale().getId();
        Long productId = saleItem.getProduct().getId();

        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new RuntimeException("Sale not found with ID: " + saleId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + productId));

        if (product.getUnitPrice() == null) {
            throw new RuntimeException("Product unit price is missing");
        }

        BigDecimal unitPrice = product.getUnitPrice();
        BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(saleItem.getQuantity()));

        saleItem.setSale(sale);
        saleItem.setProduct(product);
        saleItem.setUnitPrice(unitPrice);
        saleItem.setSubtotal(subtotal);

        SaleItem savedItem = saleItemRepository.save(saleItem);

        savedItem.setSale(null);
        savedItem.setProduct(null);

        return savedItem;
    }

    @Override
    public List<SaleItem> getAllSaleItems() {
        return saleItemRepository.findAll();
    }

    @Override
    public SaleItem getSaleItemById(Long id) {
        return saleItemRepository.findById(id).orElse(null);
    }

    @Override
    public SaleItem updateSaleItem(Long id, SaleItem saleItem) {
        SaleItem existingSaleItem = saleItemRepository.findById(id).orElse(null);

        if (existingSaleItem == null) {
            return null;
        }

        if (saleItem.getSale() == null || saleItem.getSale().getId() == null) {
            throw new RuntimeException("Sale ID is missing");
        }

        if (saleItem.getProduct() == null || saleItem.getProduct().getId() == null) {
            throw new RuntimeException("Product ID is missing");
        }

        if (saleItem.getQuantity() == null || saleItem.getQuantity() <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        Long saleId = saleItem.getSale().getId();
        Long productId = saleItem.getProduct().getId();

        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new RuntimeException("Sale not found with ID: " + saleId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + productId));

        if (product.getUnitPrice() == null) {
            throw new RuntimeException("Product unit price is missing");
        }

        BigDecimal unitPrice = product.getUnitPrice();
        BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(saleItem.getQuantity()));

        existingSaleItem.setSale(sale);
        existingSaleItem.setProduct(product);
        existingSaleItem.setQuantity(saleItem.getQuantity());
        existingSaleItem.setUnitPrice(unitPrice);
        existingSaleItem.setSubtotal(subtotal);

        SaleItem updatedItem = saleItemRepository.save(existingSaleItem);

        updatedItem.setSale(null);
        updatedItem.setProduct(null);

        return updatedItem;
    }

    @Override
    public void deleteSaleItem(Long id) {
        saleItemRepository.deleteById(id);
    }
}