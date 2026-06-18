package com.smartbiz.service.impl;

import com.smartbiz.dto.InvoiceRequestDto;
import com.smartbiz.dto.InvoiceResponseDto;
import com.smartbiz.entity.Invoice;
import com.smartbiz.entity.Sale;
import com.smartbiz.entity.User;
import com.smartbiz.exception.AccessDeniedException;
import com.smartbiz.exception.BadRequestException;
import com.smartbiz.exception.ResourceNotFoundException;
import com.smartbiz.repository.InvoiceRepository;
import com.smartbiz.repository.SaleRepository;
import com.smartbiz.repository.UserRepository;
import com.smartbiz.service.InvoiceService;
import com.smartbiz.util.InvoiceNumberGenerator;
import com.smartbiz.util.SecurityHelper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final SaleRepository saleRepository;
    private final UserRepository userRepository;

    public InvoiceServiceImpl(InvoiceRepository invoiceRepository,
                              SaleRepository saleRepository,
                              UserRepository userRepository) {
        this.invoiceRepository = invoiceRepository;
        this.saleRepository = saleRepository;
        this.userRepository = userRepository;
    }

    @Override
    public InvoiceResponseDto saveInvoice(InvoiceRequestDto request) {
        User loggedInUser = SecurityHelper.getLoggedInUser(userRepository);
        Long businessId = loggedInUser.getBusiness().getId();

        Sale sale = saleRepository.findById(request.getSaleId())
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found"));

        if (!sale.getBusiness().getId().equals(businessId)) {
            throw new AccessDeniedException("Access denied");
        }

        if (invoiceRepository.findBySaleId(request.getSaleId()).isPresent()) {
            throw new BadRequestException("Invoice already exists for this sale");
        }

        Invoice invoice = Invoice.builder()
                .invoiceNumber(
                        request.getInvoiceNumber() == null || request.getInvoiceNumber().isBlank()
                                ? InvoiceNumberGenerator.generateInvoiceNumber()
                                : request.getInvoiceNumber()
                )
                .dueDate(request.getDueDate())
                .status(request.getStatus())
                .totalAmount(sale.getTotalAmount())
                .sale(sale)
                .build();

        Invoice saved = invoiceRepository.save(invoice);
        return mapToDto(saved);
    }

    @Override
    public List<InvoiceResponseDto> getAllInvoices() {
        User loggedInUser = SecurityHelper.getLoggedInUser(userRepository);
        Long businessId = loggedInUser.getBusiness().getId();

        return invoiceRepository.findBySaleBusinessId(businessId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public InvoiceResponseDto getInvoiceById(Long id) {
        User loggedInUser = SecurityHelper.getLoggedInUser(userRepository);
        Long businessId = loggedInUser.getBusiness().getId();

        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        if (!invoice.getSale().getBusiness().getId().equals(businessId)) {
            throw new AccessDeniedException("Access denied");
        }

        return mapToDto(invoice);
    }

    @Override
    public InvoiceResponseDto getInvoiceBySaleId(Long saleId) {

        User loggedInUser = SecurityHelper.getLoggedInUser(userRepository);
        Long businessId = loggedInUser.getBusiness().getId();

        Invoice invoice = invoiceRepository.findBySaleId(saleId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Invoice not found"));

        if (!invoice.getSale().getBusiness().getId().equals(businessId)) {
            throw new AccessDeniedException("Access denied");
        }

        return mapToDto(invoice);
    }

    @Override
    public InvoiceResponseDto updateInvoice(Long id, InvoiceRequestDto request) {
        User loggedInUser = SecurityHelper.getLoggedInUser(userRepository);
        Long businessId = loggedInUser.getBusiness().getId();

        Invoice existing = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        if (!existing.getSale().getBusiness().getId().equals(businessId)) {
            throw new AccessDeniedException("Access denied");
        }

        Sale sale = saleRepository.findById(request.getSaleId())
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found"));

        if (!sale.getBusiness().getId().equals(businessId)) {
            throw new AccessDeniedException("Access denied");
        }

        existing.setInvoiceNumber(
                request.getInvoiceNumber() == null || request.getInvoiceNumber().isBlank()
                        ? existing.getInvoiceNumber()
                        : request.getInvoiceNumber()
        );
        existing.setDueDate(request.getDueDate());
        existing.setStatus(request.getStatus());
        existing.setSale(sale);
        existing.setTotalAmount(sale.getTotalAmount());

        Invoice updated = invoiceRepository.save(existing);
        return mapToDto(updated);
    }

    @Override
    public void deleteInvoice(Long id) {
        User loggedInUser = SecurityHelper.getLoggedInUser(userRepository);
        Long businessId = loggedInUser.getBusiness().getId();

        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        if (!invoice.getSale().getBusiness().getId().equals(businessId)) {
            throw new AccessDeniedException("Access denied");
        }

        invoiceRepository.deleteById(id);
    }

    private InvoiceResponseDto mapToDto(Invoice invoice) {
        return InvoiceResponseDto.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .issueDate(invoice.getIssueDate())
                .dueDate(invoice.getDueDate())
                .totalAmount(invoice.getTotalAmount())
                .status(invoice.getStatus())
                .saleId(invoice.getSale().getId())
                .build();
    }
}