package com.smartbiz.service.impl;

import com.smartbiz.dto.DashboardSummaryDto;
import com.smartbiz.repository.CustomerRepository;
import com.smartbiz.repository.ExpenseRepository;
import com.smartbiz.repository.InvoiceRepository;
import com.smartbiz.repository.ProductRepository;
import com.smartbiz.repository.SaleRepository;
import com.smartbiz.service.DashboardService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;
    private final InvoiceRepository invoiceRepository;
    private final ExpenseRepository expenseRepository;

    public DashboardServiceImpl(CustomerRepository customerRepository,
                                ProductRepository productRepository,
                                SaleRepository saleRepository,
                                InvoiceRepository invoiceRepository,
                                ExpenseRepository expenseRepository) {
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.saleRepository = saleRepository;
        this.invoiceRepository = invoiceRepository;
        this.expenseRepository = expenseRepository;
    }

    @Override
    public DashboardSummaryDto getDashboardSummary() {
        long totalCustomers = customerRepository.count();
        long totalProducts = productRepository.count();
        long totalSales = saleRepository.count();
        long totalInvoices = invoiceRepository.count();

        BigDecimal totalRevenue = saleRepository.getTotalRevenue();
        BigDecimal totalExpenses = expenseRepository.getTotalExpenses();
        BigDecimal netProfit = totalRevenue.subtract(totalExpenses);

        return DashboardSummaryDto.builder()
                .totalCustomers(totalCustomers)
                .totalProducts(totalProducts)
                .totalSales(totalSales)
                .totalInvoices(totalInvoices)
                .totalRevenue(totalRevenue)
                .totalExpenses(totalExpenses)
                .netProfit(netProfit)
                .build();
    }
}