package com.smartbiz.dto;

import com.smartbiz.enums.PaymentMethod;
import com.smartbiz.enums.SaleStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class SaleRequestDto {
    private BigDecimal totalAmount;
    private BigDecimal discount;
    private PaymentMethod paymentMethod;
    private SaleStatus status;
    private Long customerId;

    private List<SaleItemRequestDto> items;
}