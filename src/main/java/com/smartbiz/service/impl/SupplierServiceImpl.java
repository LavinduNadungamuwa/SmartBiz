package com.smartbiz.service.impl;

import com.smartbiz.dto.SupplierRequestDto;
import com.smartbiz.dto.SupplierResponseDto;
import com.smartbiz.entity.Business;
import com.smartbiz.entity.Supplier;
import com.smartbiz.entity.User;
import com.smartbiz.repository.SupplierRepository;
import com.smartbiz.repository.UserRepository;
import com.smartbiz.security.SecurityUtils;
import com.smartbiz.service.SupplierService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;

    public SupplierServiceImpl(SupplierRepository supplierRepository,
                               UserRepository userRepository) {
        this.supplierRepository = supplierRepository;
        this.userRepository = userRepository;
    }

    @Override
    public SupplierResponseDto saveSupplier(SupplierRequestDto request) {
        User loggedInUser = getLoggedInUser();
        Business business = loggedInUser.getBusiness();

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
        User loggedInUser = getLoggedInUser();
        Long businessId = loggedInUser.getBusiness().getId();

        return supplierRepository.findByBusinessId(businessId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public SupplierResponseDto getSupplierById(Long id) {
        User loggedInUser = getLoggedInUser();
        Long businessId = loggedInUser.getBusiness().getId();

        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        if (!supplier.getBusiness().getId().equals(businessId)) {
            throw new RuntimeException("Access denied");
        }

        return mapToDto(supplier);
    }

    @Override
    public SupplierResponseDto updateSupplier(Long id, SupplierRequestDto request) {
        User loggedInUser = getLoggedInUser();
        Long businessId = loggedInUser.getBusiness().getId();

        Supplier existing = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        if (!existing.getBusiness().getId().equals(businessId)) {
            throw new RuntimeException("Access denied");
        }

        existing.setSupplierName(request.getSupplierName());
        existing.setEmail(request.getEmail());
        existing.setPhone(request.getPhone());
        existing.setAddress(request.getAddress());

        Supplier updated = supplierRepository.save(existing);
        return mapToDto(updated);
    }

    @Override
    public void deleteSupplier(Long id) {
        User loggedInUser = getLoggedInUser();
        Long businessId = loggedInUser.getBusiness().getId();

        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        if (!supplier.getBusiness().getId().equals(businessId)) {
            throw new RuntimeException("Access denied");
        }

        supplierRepository.deleteById(id);
    }

    // 🔑 Get logged-in user from JWT
    private User getLoggedInUser() {
        String email = SecurityUtils.getCurrentUserEmail();

        if (email == null) {
            throw new RuntimeException("No authenticated user found");
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Logged-in user not found"));
    }

    // 🔄 Map entity → DTO
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