package com.smartbiz.service.impl;

import com.smartbiz.dto.SaleItemRequestDto;
import com.smartbiz.dto.SaleRequestDto;
import com.smartbiz.dto.SaleResponseDto;
import com.smartbiz.entity.*;
import com.smartbiz.enums.InvoiceStatus;
import com.smartbiz.exception.AccessDeniedException;
import com.smartbiz.exception.ResourceNotFoundException;
import com.smartbiz.repository.*;
import com.smartbiz.service.SaleService;
import com.smartbiz.util.InvoiceNumberGenerator;
import com.smartbiz.util.SecurityHelper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SaleServiceImpl implements SaleService {

    private final SaleRepository saleRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final SaleItemRepository saleItemRepository;
    private final ProductRepository productRepository;
    private final InvoiceRepository invoiceRepository;

    public SaleServiceImpl(SaleRepository saleRepository,
                           CustomerRepository customerRepository,
                           UserRepository userRepository,
                           SaleItemRepository saleItemRepository,
                           ProductRepository productRepository, InvoiceRepository invoiceRepository) {
        this.saleRepository = saleRepository;
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
        this.saleItemRepository = saleItemRepository;
        this.productRepository = productRepository;
        this.invoiceRepository = invoiceRepository;
    }

    @Override
    public SaleResponseDto saveSale(SaleRequestDto request) {
        User loggedInUser = SecurityHelper.getLoggedInUser(userRepository);
        Business business = loggedInUser.getBusiness();

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        if (!customer.getBusiness().getId().equals(business.getId())) {
            throw new AccessDeniedException("Access denied");
        }

        Sale sale = Sale.builder()
                .totalAmount(request.getTotalAmount())
                .discount(request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO)
                .paymentMethod(request.getPaymentMethod())
                .status(request.getStatus())
                .business(business)
                .customer(customer)
                .user(loggedInUser)
                .build();

        Sale saved = saleRepository.save(sale);

        if (request.getItems() != null) {

            for (SaleItemRequestDto itemDto : request.getItems()) {

                Product product = productRepository.findById(itemDto.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

                SaleItem saleItem = SaleItem.builder()
                        .sale(saved)
                        .product(product)
                        .quantity(itemDto.getQuantity())
                        .unitPrice(product.getUnitPrice())
                        .subtotal(
                                product.getUnitPrice()
                                        .multiply(BigDecimal.valueOf(itemDto.getQuantity())))
                        .build();

                saleItemRepository.save(saleItem);
            }
        }

        saved = saleRepository.findById(saved.getId())
                .orElseThrow();

        if (invoiceRepository.findBySaleId(saved.getId()).isEmpty()) {

            Invoice invoice = Invoice.builder()
                    .invoiceNumber(
                            InvoiceNumberGenerator.generateInvoiceNumber())
                    .sale(saved)
                    .totalAmount(saved.getTotalAmount())
                    .status(InvoiceStatus.PAID)
                    .build();

            invoiceRepository.save(invoice);
        }

        return mapToDto(saved);
    }

    @Override
    public List<SaleResponseDto> getAllSales() {
        User loggedInUser = SecurityHelper.getLoggedInUser(userRepository);
        Long businessId = loggedInUser.getBusiness().getId();

        return saleRepository.findByBusinessIdWithItems(businessId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public SaleResponseDto getSaleById(Long id) {
        User loggedInUser = SecurityHelper.getLoggedInUser(userRepository);
        Long businessId = loggedInUser.getBusiness().getId();

        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found"));

        if (!sale.getBusiness().getId().equals(businessId)) {
            throw new AccessDeniedException("Access denied");
        }

        return mapToDto(sale);
    }

    @Override
    public SaleResponseDto updateSale(Long id, SaleRequestDto request) {
        User loggedInUser = SecurityHelper.getLoggedInUser(userRepository);
        Business business = loggedInUser.getBusiness();
        Long businessId = business.getId();

        Sale existing = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found"));

        if (!existing.getBusiness().getId().equals(businessId)) {
            throw new AccessDeniedException("Access denied");
        }

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        if (!customer.getBusiness().getId().equals(businessId)) {
            throw new AccessDeniedException("Access denied");
        }

        // Update sale details
        existing.setTotalAmount(request.getTotalAmount());
        existing.setDiscount(
                request.getDiscount() != null
                        ? request.getDiscount()
                        : BigDecimal.ZERO);
        existing.setPaymentMethod(request.getPaymentMethod());
        existing.setStatus(request.getStatus());
        existing.setCustomer(customer);
        existing.setUser(loggedInUser);
        existing.setBusiness(business);

        // Remove old sale items
        saleItemRepository.deleteBySaleId(existing.getId());

        // Add updated sale items
        if (request.getItems() != null) {

            for (SaleItemRequestDto itemDto : request.getItems()) {

                Product product = productRepository.findById(itemDto.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

                SaleItem saleItem = SaleItem.builder()
                        .sale(existing)
                        .product(product)
                        .quantity(itemDto.getQuantity())
                        .unitPrice(product.getUnitPrice())
                        .subtotal(
                                product.getUnitPrice()
                                        .multiply(BigDecimal.valueOf(itemDto.getQuantity())))
                        .build();

                saleItemRepository.save(saleItem);
            }
        }

        Sale updated = saleRepository.save(existing);

        Invoice invoice = invoiceRepository.findBySaleId(updated.getId())
                .orElse(null);

        if (invoice != null) {
            invoice.setTotalAmount(updated.getTotalAmount());
            invoiceRepository.save(invoice);
        }

        updated = saleRepository.findById(updated.getId())
                .orElseThrow();

        return mapToDto(updated);
    }

    @Override
    public void deleteSale(Long id) {
        User loggedInUser = SecurityHelper.getLoggedInUser(userRepository);
        Long businessId = loggedInUser.getBusiness().getId();

        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found"));

        if (!sale.getBusiness().getId().equals(businessId)) {
            throw new AccessDeniedException("Access denied");
        }

        saleRepository.deleteById(id);
    }

    private SaleResponseDto mapToDto(Sale sale) {

        String products = sale.getSaleItems()
                .stream()
                .map(item -> item.getProduct().getProductName())
                .collect(Collectors.joining(", "));

        System.out.println(
                "Sale " + sale.getId() +
                        " items count = " +
                        sale.getSaleItems().size());

        return SaleResponseDto.builder()
                .id(sale.getId())
                .products(products)
                .saleDate(sale.getSaleDate())
                .totalAmount(sale.getTotalAmount())
                .discount(sale.getDiscount())
                .paymentMethod(sale.getPaymentMethod())
                .status(sale.getStatus())
                .businessId(sale.getBusiness().getId())
                .customerId(sale.getCustomer().getId())
                .userId(sale.getUser().getId())
                .build();
    }
}