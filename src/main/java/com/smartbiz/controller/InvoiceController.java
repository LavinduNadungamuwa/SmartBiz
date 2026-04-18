package com.smartbiz.controller;

import com.smartbiz.dto.InvoiceRequestDto;
import com.smartbiz.dto.InvoiceResponseDto;
import com.smartbiz.service.InvoiceService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public InvoiceResponseDto createInvoice(@RequestBody InvoiceRequestDto request) {
        return invoiceService.saveInvoice(request);
    }

    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping
    public List<InvoiceResponseDto> getAllInvoices() {
        return invoiceService.getAllInvoices();
    }

    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping("/{id}")
    public InvoiceResponseDto getInvoiceById(@PathVariable Long id) {
        return invoiceService.getInvoiceById(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public InvoiceResponseDto updateInvoice(@PathVariable Long id,
                                            @RequestBody InvoiceRequestDto request) {
        return invoiceService.updateInvoice(id, request);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
    }
}