package com.smartbiz.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.smartbiz.enums.PaymentMethod;

@Data
@Builder
public class ExpenseResponseDto {
    private Long id;
    private LocalDateTime createdAt;
    private String title;
    private String category;
    private BigDecimal amount;
    private LocalDate expenseDate;
    private PaymentMethod paymentMethod;
    private String notes;
    private Long businessId;
    private Long userId;
}