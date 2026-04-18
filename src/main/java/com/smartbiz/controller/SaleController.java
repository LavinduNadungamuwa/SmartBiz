package com.smartbiz.controller;

import com.smartbiz.dto.SaleRequestDto;
import com.smartbiz.dto.SaleResponseDto;
import com.smartbiz.service.SaleService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
@CrossOrigin
public class SaleController {

    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @PostMapping
    public SaleResponseDto createSale(@RequestBody SaleRequestDto request) {
        return saleService.saveSale(request);
    }

    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping
    public List<SaleResponseDto> getAllSales() {
        return saleService.getAllSales();
    }

    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping("/{id}")
    public SaleResponseDto getSaleById(@PathVariable Long id) {
        return saleService.getSaleById(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @PutMapping("/{id}")
    public SaleResponseDto updateSale(@PathVariable Long id,
                                      @RequestBody SaleRequestDto request) {
        return saleService.updateSale(id, request);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteSale(@PathVariable Long id) {
        saleService.deleteSale(id);
    }
}