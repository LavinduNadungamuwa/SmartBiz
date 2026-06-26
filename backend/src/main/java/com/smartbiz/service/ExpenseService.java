package com.smartbiz.service;

import com.smartbiz.dto.ExpenseRequestDto;
import com.smartbiz.dto.ExpenseResponseDto;

import java.util.List;

public interface ExpenseService {
    ExpenseResponseDto saveExpense(ExpenseRequestDto request);
    List<ExpenseResponseDto> getAllExpenses();
    ExpenseResponseDto getExpenseById(Long id);
    ExpenseResponseDto updateExpense(Long id, ExpenseRequestDto request);
    void deleteExpense(Long id);
}