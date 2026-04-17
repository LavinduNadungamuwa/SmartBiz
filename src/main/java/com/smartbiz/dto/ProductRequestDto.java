package com.smartbiz.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductRequestDto {
    private String productName;
    private String category;
    private String description;
    private BigDecimal unitPrice;
    private Integer stockQuantity;
    private Long businessId;
    private Long supplierId;
}