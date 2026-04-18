package com.smartbiz.service.impl;

import com.smartbiz.dto.SaleRequestDto;
import com.smartbiz.dto.SaleResponseDto;
import com.smartbiz.entity.Business;
import com.smartbiz.entity.Customer;
import com.smartbiz.entity.Sale;
import com.smartbiz.entity.User;
import com.smartbiz.repository.CustomerRepository;
import com.smartbiz.repository.SaleRepository;
import com.smartbiz.repository.UserRepository;
import com.smartbiz.security.SecurityUtils;
import com.smartbiz.service.SaleService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SaleServiceImpl implements SaleService {

    private final SaleRepository saleRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    public SaleServiceImpl(SaleRepository saleRepository,
                           CustomerRepository customerRepository,
                           UserRepository userRepository) {
        this.saleRepository = saleRepository;
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
    }

    @Override
    public SaleResponseDto saveSale(SaleRequestDto request) {
        User loggedInUser = getLoggedInUser();
        Business business = loggedInUser.getBusiness();

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        if (!customer.getBusiness().getId().equals(business.getId())) {
            throw new RuntimeException("Access denied");
        }

        Sale sale = Sale.builder()
                .totalAmount(request.getTotalAmount())
                .paymentMethod(request.getPaymentMethod())
                .status(request.getStatus())
                .business(business)
                .customer(customer)
                .user(loggedInUser)
                .build();

        Sale saved = saleRepository.save(sale);
        return mapToDto(saved);
    }

    @Override
    public List<SaleResponseDto> getAllSales() {
        User loggedInUser = getLoggedInUser();
        Long businessId = loggedInUser.getBusiness().getId();

        return saleRepository.findByBusinessId(businessId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public SaleResponseDto getSaleById(Long id) {
        User loggedInUser = getLoggedInUser();
        Long businessId = loggedInUser.getBusiness().getId();

        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sale not found"));

        if (!sale.getBusiness().getId().equals(businessId)) {
            throw new RuntimeException("Access denied");
        }

        return mapToDto(sale);
    }

    @Override
    public SaleResponseDto updateSale(Long id, SaleRequestDto request) {
        User loggedInUser = getLoggedInUser();
        Business business = loggedInUser.getBusiness();
        Long businessId = business.getId();

        Sale existing = saleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sale not found"));

        if (!existing.getBusiness().getId().equals(businessId)) {
            throw new RuntimeException("Access denied");
        }

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        if (!customer.getBusiness().getId().equals(businessId)) {
            throw new RuntimeException("Access denied");
        }

        existing.setTotalAmount(request.getTotalAmount());
        existing.setPaymentMethod(request.getPaymentMethod());
        existing.setStatus(request.getStatus());
        existing.setCustomer(customer);
        existing.setUser(loggedInUser);
        existing.setBusiness(business);

        Sale updated = saleRepository.save(existing);
        return mapToDto(updated);
    }

    @Override
    public void deleteSale(Long id) {
        User loggedInUser = getLoggedInUser();
        Long businessId = loggedInUser.getBusiness().getId();

        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sale not found"));

        if (!sale.getBusiness().getId().equals(businessId)) {
            throw new RuntimeException("Access denied");
        }

        saleRepository.deleteById(id);
    }

    private User getLoggedInUser() {
        String email = SecurityUtils.getCurrentUserEmail();

        if (email == null) {
            throw new RuntimeException("No authenticated user found");
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Logged-in user not found"));
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