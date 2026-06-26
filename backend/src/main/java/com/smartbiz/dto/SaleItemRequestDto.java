package com.smartbiz.dto;

import lombok.Data;

@Data
public class SaleItemRequestDto {
    private Integer quantity;
    private Long saleId;
    private Long productId;
}