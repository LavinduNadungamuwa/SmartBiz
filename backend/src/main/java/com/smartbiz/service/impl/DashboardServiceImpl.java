package com.smartbiz.service.impl;

import com.smartbiz.dto.DashboardSummaryDto;
import com.smartbiz.entity.User;
import com.smartbiz.repository.CustomerRepository;
import com.smartbiz.repository.ExpenseRepository;
import com.smartbiz.repository.InvoiceRepository;
import com.smartbiz.repository.ProductRepository;
import com.smartbiz.repository.SaleRepository;
import com.smartbiz.repository.UserRepository;
import com.smartbiz.service.DashboardService;
import com.smartbiz.util.SecurityHelper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;
    private final InvoiceRepository invoiceRepository;
    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public DashboardServiceImpl(CustomerRepository customerRepository,
                                ProductRepository productRepository,
                                SaleRepository saleRepository,
                                InvoiceRepository invoiceRepository,
                                ExpenseRepository expenseRepository,
                                UserRepository userRepository) {
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.saleRepository = saleRepository;
        this.invoiceRepository = invoiceRepository;
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
    }

    @Override
    public DashboardSummaryDto getDashboardSummary() {
        User loggedInUser = SecurityHelper.getLoggedInUser(userRepository);
        Long businessId = loggedInUser.getBusiness().getId();

        long totalCustomers = customerRepository.findByBusinessId(businessId).size();
        long totalProducts = productRepository.findByBusinessId(businessId).size();
        long totalSales = saleRepository.findByBusinessId(businessId).size();
        long totalInvoices = invoiceRepository.findBySaleBusinessId(businessId).size();

        BigDecimal totalRevenue = saleRepository.getTotalRevenueByBusinessId(businessId);
        BigDecimal totalExpenses = expenseRepository.getTotalExpensesByBusinessId(businessId);
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