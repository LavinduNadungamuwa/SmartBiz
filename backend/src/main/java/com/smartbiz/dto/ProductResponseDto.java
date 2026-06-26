package com.smartbiz.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ProductResponseDto {
    private Long id;
    private String productName;
    private String category;
    private String description;
    private BigDecimal unitPrice;
    private Integer stockQuantity;
    private Long businessId;
    private Long supplierId;
}