package com.smartbiz.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ExpenseRequestDto {
    private String title;
    private String category;
    private BigDecimal amount;
    private LocalDateTime expenseDate;
    private String notes;
}