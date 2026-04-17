package com.smartbiz.service;

import com.smartbiz.dto.CustomerRequestDto;
import com.smartbiz.dto.CustomerResponseDto;

import java.util.List;

public interface CustomerService {
    CustomerResponseDto saveCustomer(CustomerRequestDto request);
    List<CustomerResponseDto> getAllCustomers();
    CustomerResponseDto getCustomerById(Long id);
    CustomerResponseDto updateCustomer(Long id, CustomerRequestDto request);
    void deleteCustomer(Long id);
}