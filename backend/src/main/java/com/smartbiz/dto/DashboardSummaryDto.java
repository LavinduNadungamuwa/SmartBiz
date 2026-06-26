package com.smartbiz.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class DashboardSummaryDto {
    private long totalCustomers;
    private long totalProducts;
    private long totalSales;
    private long totalInvoices;
    private BigDecimal totalRevenue;
    private BigDecimal totalExpenses;
    private BigDecimal netProfit;
}