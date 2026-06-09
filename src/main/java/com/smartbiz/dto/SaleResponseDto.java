package com.smartbiz.dto;

import com.smartbiz.enums.PaymentMethod;
import com.smartbiz.enums.SaleStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class SaleResponseDto {
    private Long id;
    private LocalDateTime saleDate;
    private BigDecimal totalAmount;
    private PaymentMethod paymentMethod;
    private SaleStatus status;
    private Long businessId;
    private Long customerId;
    private Long userId;
    private String products;
}