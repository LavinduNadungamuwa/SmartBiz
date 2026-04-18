package com.smartbiz.service.impl;

import com.smartbiz.dto.CustomerRequestDto;
import com.smartbiz.dto.CustomerResponseDto;
import com.smartbiz.entity.Business;
import com.smartbiz.entity.Customer;
import com.smartbiz.repository.BusinessRepository;
import com.smartbiz.repository.CustomerRepository;
import com.smartbiz.service.CustomerService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final BusinessRepository businessRepository;

    public CustomerServiceImpl(CustomerRepository customerRepository,
                               BusinessRepository businessRepository) {
        this.customerRepository = customerRepository;
        this.businessRepository = businessRepository;
    }

    @Override
    public CustomerResponseDto saveCustomer(CustomerRequestDto request) {
        Business business = businessRepository.findById(request.getBusinessId())
                .orElseThrow(() -> new RuntimeException("Business not found"));

        Customer customer = Customer.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .business(business)
                .build();

        Customer saved = customerRepository.save(customer);
        return mapToDto(saved);
    }

    @Override
    public List<CustomerResponseDto> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public CustomerResponseDto getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id).orElse(null);
        return customer == null ? null : mapToDto(customer);
    }

    @Override
    public CustomerResponseDto updateCustomer(Long id, CustomerRequestDto request) {
        Customer existing = customerRepository.findById(id).orElse(null);
        if (existing == null) return null;

        Business business = businessRepository.findById(request.getBusinessId())
                .orElseThrow(() -> new RuntimeException("Business not found"));

        existing.setFullName(request.getFullName());
        existing.setEmail(request.getEmail());
        existing.setPhone(request.getPhone());
        existing.setAddress(request.getAddress());
        existing.setBusiness(business);

        Customer updated = customerRepository.save(existing);
        return mapToDto(updated);
    }

    @Override
    public void deleteCustomer(Long id) {
        customerRepository.deleteById(id);
    }

    private CustomerResponseDto mapToDto(Customer customer) {
        return CustomerResponseDto.builder()
                .id(customer.getId())
                .fullName(customer.getFullName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .address(customer.getAddress())
                .businessId(customer.getBusiness().getId())
                .build();
    }
}