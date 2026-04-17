package com.smartbiz.service.impl;

import com.smartbiz.dto.SupplierRequestDto;
import com.smartbiz.dto.SupplierResponseDto;
import com.smartbiz.entity.Business;
import com.smartbiz.entity.Supplier;
import com.smartbiz.repository.BusinessRepository;
import com.smartbiz.repository.SupplierRepository;
import com.smartbiz.service.SupplierService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final BusinessRepository businessRepository;

    public SupplierServiceImpl(SupplierRepository supplierRepository,
                               BusinessRepository businessRepository) {
        this.supplierRepository = supplierRepository;
        this.businessRepository = businessRepository;
    }

    @Override
    public SupplierResponseDto saveSupplier(SupplierRequestDto request) {
        Business business = businessRepository.findById(request.getBusinessId())
                .orElseThrow(() -> new RuntimeException("Business not found"));

        Supplier supplier = Supplier.builder()
                .supplierName(request.getSupplierName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .business(business)
                .build();

        Supplier saved = supplierRepository.save(supplier);
        return mapToDto(saved);
    }

    @Override
    public List<SupplierResponseDto> getAllSuppliers() {
        return supplierRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public SupplierResponseDto getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id).orElse(null);
        return supplier == null ? null : mapToDto(supplier);
    }

    @Override
    public SupplierResponseDto updateSupplier(Long id, SupplierRequestDto request) {
        Supplier existing = supplierRepository.findById(id).orElse(null);

        if (existing == null) {
            return null;
        }

        Business business = businessRepository.findById(request.getBusinessId())
                .orElseThrow(() -> new RuntimeException("Business not found"));

        existing.setSupplierName(request.getSupplierName());
        existing.setEmail(request.getEmail());
        existing.setPhone(request.getPhone());
        existing.setAddress(request.getAddress());
        existing.setBusiness(business);

        Supplier updated = supplierRepository.save(existing);
        return mapToDto(updated);
    }

    @Override
    public void deleteSupplier(Long id) {
        supplierRepository.deleteById(id);
    }

    private SupplierResponseDto mapToDto(Supplier supplier) {
        return SupplierResponseDto.builder()
                .id(supplier.getId())
                .supplierName(supplier.getSupplierName())
                .email(supplier.getEmail())
                .phone(supplier.getPhone())
                .address(supplier.getAddress())
                .businessId(supplier.getBusiness().getId())
                .build();
    }
}