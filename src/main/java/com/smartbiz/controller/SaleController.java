package com.smartbiz.controller;

import com.smartbiz.dto.SaleRequestDto;
import com.smartbiz.dto.SaleResponseDto;
import com.smartbiz.service.SaleService;
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

    @PostMapping
    public SaleResponseDto createSale(@RequestBody SaleRequestDto request) {
        return saleService.saveSale(request);
    }

    @GetMapping
    public List<SaleResponseDto> getAllSales() {
        return saleService.getAllSales();
    }

    @GetMapping("/{id}")
    public SaleResponseDto getSaleById(@PathVariable Long id) {
        return saleService.getSaleById(id);
    }

    @PutMapping("/{id}")
    public SaleResponseDto updateSale(@PathVariable Long id,
                                      @RequestBody SaleRequestDto request) {
        return saleService.updateSale(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteSale(@PathVariable Long id) {
        saleService.deleteSale(id);
    }
}