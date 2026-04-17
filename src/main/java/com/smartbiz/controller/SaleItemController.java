package com.smartbiz.controller;

import com.smartbiz.dto.SaleItemRequestDto;
import com.smartbiz.dto.SaleItemResponseDto;
import com.smartbiz.service.SaleItemService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sale-items")
@CrossOrigin
public class SaleItemController {

    private final SaleItemService saleItemService;

    public SaleItemController(SaleItemService saleItemService) {
        this.saleItemService = saleItemService;
    }

    @PostMapping
    public SaleItemResponseDto createSaleItem(@RequestBody SaleItemRequestDto request) {
        return saleItemService.saveSaleItem(request);
    }

    @GetMapping
    public List<SaleItemResponseDto> getAllSaleItems() {
        return saleItemService.getAllSaleItems();
    }

    @GetMapping("/{id}")
    public SaleItemResponseDto getSaleItemById(@PathVariable Long id) {
        return saleItemService.getSaleItemById(id);
    }

    @PutMapping("/{id}")
    public SaleItemResponseDto updateSaleItem(@PathVariable Long id,
                                              @RequestBody SaleItemRequestDto request) {
        return saleItemService.updateSaleItem(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteSaleItem(@PathVariable Long id) {
        saleItemService.deleteSaleItem(id);
    }
}