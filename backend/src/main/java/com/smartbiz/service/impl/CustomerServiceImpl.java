package com.smartbiz.service.impl;

import com.smartbiz.dto.CustomerRequestDto;
import com.smartbiz.dto.CustomerResponseDto;
import com.smartbiz.entity.Business;
import com.smartbiz.entity.Customer;
import com.smartbiz.entity.User;
import com.smartbiz.exception.AccessDeniedException;
import com.smartbiz.exception.ResourceNotFoundException;
import com.smartbiz.repository.CustomerRepository;
import com.smartbiz.repository.UserRepository;
import com.smartbiz.service.CustomerService;
import com.smartbiz.util.SecurityHelper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    public CustomerServiceImpl(CustomerRepository customerRepository,
                               UserRepository userRepository) {
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
    }

    @Override
    public CustomerResponseDto saveCustomer(CustomerRequestDto request) {
        User loggedInUser = SecurityHelper.getLoggedInUser(userRepository);
        Business business = loggedInUser.getBusiness();

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
        User loggedInUser = SecurityHelper.getLoggedInUser(userRepository);
        Long businessId = loggedInUser.getBusiness().getId();

        return customerRepository.findByBusinessId(businessId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public CustomerResponseDto getCustomerById(Long id) {
        User loggedInUser = SecurityHelper.getLoggedInUser(userRepository);
        Long businessId = loggedInUser.getBusiness().getId();

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        if (!customer.getBusiness().getId().equals(businessId)) {
            throw new AccessDeniedException("Access denied");
        }

        return mapToDto(customer);
    }

    @Override
    public CustomerResponseDto updateCustomer(Long id, CustomerRequestDto request) {
        User loggedInUser = SecurityHelper.getLoggedInUser(userRepository);
        Long businessId = loggedInUser.getBusiness().getId();

        Customer existing = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        if (!existing.getBusiness().getId().equals(businessId)) {
            throw new AccessDeniedException("Access denied");
        }

        existing.setFullName(request.getFullName());
        existing.setEmail(request.getEmail());
        existing.setPhone(request.getPhone());
        existing.setAddress(request.getAddress());

        Customer updated = customerRepository.save(existing);
        return mapToDto(updated);
    }

    @Override
    public void deleteCustomer(Long id) {
        User loggedInUser = SecurityHelper.getLoggedInUser(userRepository);
        Long businessId = loggedInUser.getBusiness().getId();

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        if (!customer.getBusiness().getId().equals(businessId)) {
            throw new AccessDeniedException("Access denied");
        }

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