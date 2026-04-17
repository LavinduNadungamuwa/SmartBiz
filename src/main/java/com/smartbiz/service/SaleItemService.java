package com.smartbiz.service;

import com.smartbiz.entity.SaleItem;

import java.util.List;

public interface SaleItemService {
    SaleItem saveSaleItem(SaleItem saleItem);
    List<SaleItem> getAllSaleItems();
    SaleItem getSaleItemById(Long id);
    SaleItem updateSaleItem(Long id, SaleItem saleItem);
    void deleteSaleItem(Long id);
}