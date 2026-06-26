package com.smartbiz.repository;

import com.smartbiz.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByBusinessId(Long businessId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.business.id = :businessId")
    BigDecimal getTotalExpensesByBusinessId(@Param("businessId") Long businessId);
}