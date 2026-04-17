package com.smartbiz.controller;

import com.smartbiz.dto.SupplierRequestDto;
import com.smartbiz.dto.SupplierResponseDto;
import com.smartbiz.service.SupplierService;
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

    @PostMapping
    public SupplierResponseDto createSupplier(@RequestBody SupplierRequestDto request) {
        return supplierService.saveSupplier(request);
    }

    @GetMapping
    public List<SupplierResponseDto> getAllSuppliers() {
        return supplierService.getAllSuppliers();
    }

    @GetMapping("/{id}")
    public SupplierResponseDto getSupplierById(@PathVariable Long id) {
        return supplierService.getSupplierById(id);
    }

    @PutMapping("/{id}")
    public SupplierResponseDto updateSupplier(@PathVariable Long id,
                                              @RequestBody SupplierRequestDto request) {
        return supplierService.updateSupplier(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
    }
}