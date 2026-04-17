package com.smartbiz.service.impl;

import com.smartbiz.dto.InvoiceRequestDto;
import com.smartbiz.dto.InvoiceResponseDto;
import com.smartbiz.entity.Invoice;
import com.smartbiz.entity.Sale;
import com.smartbiz.repository.InvoiceRepository;
import com.smartbiz.repository.SaleRepository;
import com.smartbiz.service.InvoiceService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final SaleRepository saleRepository;

    public InvoiceServiceImpl(InvoiceRepository invoiceRepository,
                              SaleRepository saleRepository) {
        this.invoiceRepository = invoiceRepository;
        this.saleRepository = saleRepository;
    }

    @Override
    public InvoiceResponseDto saveInvoice(InvoiceRequestDto request) {
        Sale sale = saleRepository.findById(request.getSaleId())
                .orElseThrow(() -> new RuntimeException("Sale not found"));

        if (invoiceRepository.findBySaleId(request.getSaleId()).isPresent()) {
            throw new RuntimeException("Invoice already exists for this sale");
        }

        Invoice invoice = Invoice.builder()
                .invoiceNumber(request.getInvoiceNumber())
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
        return invoiceRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public InvoiceResponseDto getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id).orElse(null);
        return invoice == null ? null : mapToDto(invoice);
    }

    @Override
    public InvoiceResponseDto updateInvoice(Long id, InvoiceRequestDto request) {
        Invoice existing = invoiceRepository.findById(id).orElse(null);

        if (existing == null) {
            return null;
        }

        Sale sale = saleRepository.findById(request.getSaleId())
                .orElseThrow(() -> new RuntimeException("Sale not found"));

        existing.setInvoiceNumber(request.getInvoiceNumber());
        existing.setDueDate(request.getDueDate());
        existing.setStatus(request.getStatus());
        existing.setSale(sale);
        existing.setTotalAmount(sale.getTotalAmount());

        Invoice updated = invoiceRepository.save(existing);
        return mapToDto(updated);
    }

    @Override
    public void deleteInvoice(Long id) {
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