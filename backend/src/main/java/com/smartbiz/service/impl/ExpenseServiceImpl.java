package com.smartbiz.service.impl;

import com.smartbiz.dto.ExpenseRequestDto;
import com.smartbiz.dto.ExpenseResponseDto;
import com.smartbiz.entity.Business;
import com.smartbiz.entity.Expense;
import com.smartbiz.entity.User;
import com.smartbiz.exception.AccessDeniedException;
import com.smartbiz.exception.ResourceNotFoundException;
import com.smartbiz.repository.ExpenseRepository;
import com.smartbiz.repository.UserRepository;
import com.smartbiz.service.ExpenseService;
import com.smartbiz.util.SecurityHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public ExpenseServiceImpl(ExpenseRepository expenseRepository,
                              UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
    }

    @Override
    public ExpenseResponseDto saveExpense(ExpenseRequestDto request) {
        User loggedInUser = SecurityHelper.getLoggedInUser(userRepository);
        Business business = loggedInUser.getBusiness();

        Expense expense = Expense.builder()
                .title(request.getTitle())
                .category(request.getCategory())
                .amount(request.getAmount())
                .expenseDate(request.getExpenseDate())
                .paymentMethod(request.getPaymentMethod())
                .notes(request.getNotes())
                .business(business)
                .user(loggedInUser)
                .build();

        Expense saved = expenseRepository.save(expense);
        return mapToDto(saved);
    }

    @Override
    public List<ExpenseResponseDto> getAllExpenses() {
        User loggedInUser = SecurityHelper.getLoggedInUser(userRepository);
        Long businessId = loggedInUser.getBusiness().getId();

        return expenseRepository.findByBusinessId(businessId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public ExpenseResponseDto getExpenseById(Long id) {
        User loggedInUser = SecurityHelper.getLoggedInUser(userRepository);
        Long businessId = loggedInUser.getBusiness().getId();

        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));

        if (!expense.getBusiness().getId().equals(businessId)) {
            throw new AccessDeniedException("Access denied");
        }

        return mapToDto(expense);
    }

    @Override
    public ExpenseResponseDto updateExpense(Long id, ExpenseRequestDto request) {
        User loggedInUser = SecurityHelper.getLoggedInUser(userRepository);
        Business business = loggedInUser.getBusiness();
        Long businessId = business.getId();

        Expense existing = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));

        if (!existing.getBusiness().getId().equals(businessId)) {
            throw new AccessDeniedException("Access denied");
        }

        existing.setTitle(request.getTitle());
        existing.setCategory(request.getCategory());
        existing.setAmount(request.getAmount());
        existing.setExpenseDate(request.getExpenseDate());
        existing.setPaymentMethod(request.getPaymentMethod());
        existing.setNotes(request.getNotes());
        existing.setBusiness(business);
        existing.setUser(loggedInUser);

        Expense updated = expenseRepository.save(existing);
        return mapToDto(updated);
    }

    @Override
    public void deleteExpense(Long id) {
        User loggedInUser = SecurityHelper.getLoggedInUser(userRepository);
        Long businessId = loggedInUser.getBusiness().getId();

        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));

        if (!expense.getBusiness().getId().equals(businessId)) {
            throw new AccessDeniedException("Access denied");
        }

        expenseRepository.deleteById(id);
    }

    private ExpenseResponseDto mapToDto(Expense expense) {
        return ExpenseResponseDto.builder()
                .id(expense.getId())
                .createdAt(expense.getCreatedAt())
                .title(expense.getTitle())
                .category(expense.getCategory())
                .amount(expense.getAmount())
                .expenseDate(expense.getExpenseDate())
                .paymentMethod(expense.getPaymentMethod())
                .notes(expense.getNotes())
                .businessId(expense.getBusiness().getId())
                .userId(expense.getUser().getId())
                .build();
    }
}