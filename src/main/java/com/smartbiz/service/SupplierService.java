package com.smartbiz.service;

import com.smartbiz.dto.SupplierRequestDto;
import com.smartbiz.dto.SupplierResponseDto;
import java.util.List;

public interface SupplierService {
    SupplierResponseDto saveSupplier(SupplierRequestDto supplier);
    List<SupplierResponseDto> getAllSuppliers();
    SupplierResponseDto getSupplierById(Long id);
    SupplierResponseDto updateSupplier(Long id, SupplierRequestDto supplier);
    void deleteSupplier(Long id);
}