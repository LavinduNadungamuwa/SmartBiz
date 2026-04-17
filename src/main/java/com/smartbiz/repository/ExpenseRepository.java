package com.smartbiz.repository;

import com.smartbiz.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e")
    BigDecimal getTotalExpenses();
}