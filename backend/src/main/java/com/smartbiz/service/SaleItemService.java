package com.smartbiz.service;

import com.smartbiz.dto.SaleItemRequestDto;
import com.smartbiz.dto.SaleItemResponseDto;

import java.util.List;

public interface SaleItemService {
    SaleItemResponseDto saveSaleItem(SaleItemRequestDto request);
    List<SaleItemResponseDto> getAllSaleItems();
    SaleItemResponseDto getSaleItemById(Long id);
    SaleItemResponseDto updateSaleItem(Long id, SaleItemRequestDto request);
    void deleteSaleItem(Long id);
}