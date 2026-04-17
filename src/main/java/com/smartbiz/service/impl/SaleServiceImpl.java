package com.smartbiz.service.impl;

import com.smartbiz.dto.SaleRequestDto;
import com.smartbiz.dto.SaleResponseDto;
import com.smartbiz.entity.Business;
import com.smartbiz.entity.Customer;
import com.smartbiz.entity.Sale;
import com.smartbiz.entity.User;
import com.smartbiz.repository.BusinessRepository;
import com.smartbiz.repository.CustomerRepository;
import com.smartbiz.repository.SaleRepository;
import com.smartbiz.repository.UserRepository;
import com.smartbiz.service.SaleService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SaleServiceImpl implements SaleService {

    private final SaleRepository saleRepository;
    private final BusinessRepository businessRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    public SaleServiceImpl(SaleRepository saleRepository,
                           BusinessRepository businessRepository,
                           CustomerRepository customerRepository,
                           UserRepository userRepository) {
        this.saleRepository = saleRepository;
        this.businessRepository = businessRepository;
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
    }

    @Override
    public SaleResponseDto saveSale(SaleRequestDto request) {
        Business business = businessRepository.findById(request.getBusinessId())
                .orElseThrow(() -> new RuntimeException("Business not found"));

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Sale sale = Sale.builder()
                .totalAmount(request.getTotalAmount())
                .paymentMethod(request.getPaymentMethod())
                .status(request.getStatus())
                .business(business)
                .customer(customer)
                .user(user)
                .build();

        Sale saved = saleRepository.save(sale);
        return mapToDto(saved);
    }

    @Override
    public List<SaleResponseDto> getAllSales() {
        return saleRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public SaleResponseDto getSaleById(Long id) {
        Sale sale = saleRepository.findById(id).orElse(null);
        return sale == null ? null : mapToDto(sale);
    }

    @Override
    public SaleResponseDto updateSale(Long id, SaleRequestDto request) {
        Sale existing = saleRepository.findById(id).orElse(null);

        if (existing == null) {
            return null;
        }

        Business business = businessRepository.findById(request.getBusinessId())
                .orElseThrow(() -> new RuntimeException("Business not found"));

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        existing.setTotalAmount(request.getTotalAmount());
        existing.setPaymentMethod(request.getPaymentMethod());
        existing.setStatus(request.getStatus());
        existing.setBusiness(business);
        existing.setCustomer(customer);
        existing.setUser(user);

        Sale updated = saleRepository.save(existing);
        return mapToDto(updated);
    }

    @Override
    public void deleteSale(Long id) {
        saleRepository.deleteById(id);
    }

    private SaleResponseDto mapToDto(Sale sale) {
        return SaleResponseDto.builder()
                .id(sale.getId())
                .saleDate(sale.getSaleDate())
                .totalAmount(sale.getTotalAmount())
                .paymentMethod(sale.getPaymentMethod())
                .status(sale.getStatus())
                .businessId(sale.getBusiness().getId())
                .customerId(sale.getCustomer().getId())
                .userId(sale.getUser().getId())
                .build();
    }
}