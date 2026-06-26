package com.smartbiz.service;

import com.smartbiz.dto.SaleRequestDto;
import com.smartbiz.dto.SaleResponseDto;

import java.util.List;

public interface SaleService {
    SaleResponseDto saveSale(SaleRequestDto request);
    List<SaleResponseDto> getAllSales();
    SaleResponseDto getSaleById(Long id);
    SaleResponseDto updateSale(Long id, SaleRequestDto request);
    void deleteSale(Long id);
}