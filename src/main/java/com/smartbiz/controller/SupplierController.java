package com.smartbiz.controller;

import com.smartbiz.dto.SupplierRequestDto;
import com.smartbiz.dto.SupplierResponseDto;
import com.smartbiz.service.SupplierService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@CrossOrigin
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public SupplierResponseDto createSupplier(@RequestBody SupplierRequestDto request) {
        return supplierService.saveSupplier(request);
    }

    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping
    public List<SupplierResponseDto> getAllSuppliers() {
        return supplierService.getAllSuppliers();
    }

    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping("/{id}")
    public SupplierResponseDto getSupplierById(@PathVariable Long id) {
        return supplierService.getSupplierById(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public SupplierResponseDto updateSupplier(@PathVariable Long id,
                                              @RequestBody SupplierRequestDto request) {
        return supplierService.updateSupplier(id, request);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
    }
}