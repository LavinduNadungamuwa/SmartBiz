package com.smartbiz.service.impl;

import com.smartbiz.dto.ExpenseRequestDto;
import com.smartbiz.dto.ExpenseResponseDto;
import com.smartbiz.entity.Business;
import com.smartbiz.entity.Expense;
import com.smartbiz.entity.User;
import com.smartbiz.repository.ExpenseRepository;
import com.smartbiz.repository.UserRepository;
import com.smartbiz.security.SecurityUtils;
import com.smartbiz.service.ExpenseService;
import org.springframework.stereotype.Service;

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
        User loggedInUser = getLoggedInUser();
        Business business = loggedInUser.getBusiness();

        Expense expense = Expense.builder()
                .title(request.getTitle())
                .category(request.getCategory())
                .amount(request.getAmount())
                .expenseDate(request.getExpenseDate())
                .notes(request.getNotes())
                .business(business)
                .user(loggedInUser)
                .build();

        Expense saved = expenseRepository.save(expense);
        return mapToDto(saved);
    }

    @Override
    public List<ExpenseResponseDto> getAllExpenses() {
        User loggedInUser = getLoggedInUser();
        Long businessId = loggedInUser.getBusiness().getId();

        return expenseRepository.findByBusinessId(businessId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public ExpenseResponseDto getExpenseById(Long id) {
        User loggedInUser = getLoggedInUser();
        Long businessId = loggedInUser.getBusiness().getId();

        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getBusiness().getId().equals(businessId)) {
            throw new RuntimeException("Access denied");
        }

        return mapToDto(expense);
    }

    @Override
    public ExpenseResponseDto updateExpense(Long id, ExpenseRequestDto request) {
        User loggedInUser = getLoggedInUser();
        Business business = loggedInUser.getBusiness();
        Long businessId = business.getId();

        Expense existing = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!existing.getBusiness().getId().equals(businessId)) {
            throw new RuntimeException("Access denied");
        }

        existing.setTitle(request.getTitle());
        existing.setCategory(request.getCategory());
        existing.setAmount(request.getAmount());
        existing.setExpenseDate(request.getExpenseDate());
        existing.setNotes(request.getNotes());
        existing.setBusiness(business);
        existing.setUser(loggedInUser);

        Expense updated = expenseRepository.save(existing);
        return mapToDto(updated);
    }

    @Override
    public void deleteExpense(Long id) {
        User loggedInUser = getLoggedInUser();
        Long businessId = loggedInUser.getBusiness().getId();

        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getBusiness().getId().equals(businessId)) {
            throw new RuntimeException("Access denied");
        }

        expenseRepository.deleteById(id);
    }

    private User getLoggedInUser() {
        String email = SecurityUtils.getCurrentUserEmail();

        if (email == null) {
            throw new RuntimeException("No authenticated user found");
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Logged-in user not found"));
    }

    private ExpenseResponseDto mapToDto(Expense expense) {
        return ExpenseResponseDto.builder()
                .id(expense.getId())
                .title(expense.getTitle())
                .category(expense.getCategory())
                .amount(expense.getAmount())
                .expenseDate(expense.getExpenseDate())
                .notes(expense.getNotes())
                .businessId(expense.getBusiness().getId())
                .userId(expense.getUser().getId())
                .build();
    }
}