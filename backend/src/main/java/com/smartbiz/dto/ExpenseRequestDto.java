package com.smartbiz.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.smartbiz.enums.PaymentMethod;

@Data
public class ExpenseRequestDto {
    private LocalDateTime createdAt;
    private String title;
    private String category;
    private BigDecimal amount;
    private LocalDate expenseDate;
    private PaymentMethod paymentMethod;
    private String notes;
}