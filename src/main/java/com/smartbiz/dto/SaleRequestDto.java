package com.smartbiz.dto;

import com.smartbiz.enums.PaymentMethod;
import com.smartbiz.enums.SaleStatus;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class SaleRequestDto {
    private BigDecimal totalAmount;
    private PaymentMethod paymentMethod;
    private SaleStatus status;
    private Long businessId;
    private Long customerId;
    private Long userId;
}