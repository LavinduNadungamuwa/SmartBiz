package com.smartbiz.controller;

import com.smartbiz.entity.SaleItem;
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
    public SaleItem createSaleItem(@RequestBody SaleItem saleItem) {
        return saleItemService.saveSaleItem(saleItem);
    }

    @GetMapping
    public List<SaleItem> getAllSaleItems() {
        return saleItemService.getAllSaleItems();
    }

    @GetMapping("/{id}")
    public SaleItem getSaleItemById(@PathVariable Long id) {
        return saleItemService.getSaleItemById(id);
    }

    @PutMapping("/{id}")
    public SaleItem updateSaleItem(@PathVariable Long id, @RequestBody SaleItem saleItem) {
        return saleItemService.updateSaleItem(id, saleItem);
    }

    @DeleteMapping("/{id}")
    public void deleteSaleItem(@PathVariable Long id) {
        saleItemService.deleteSaleItem(id);
    }
}