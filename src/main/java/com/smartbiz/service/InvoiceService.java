package com.smartbiz.service;

import com.smartbiz.dto.InvoiceRequestDto;
import com.smartbiz.dto.InvoiceResponseDto;

import java.util.List;

public interface InvoiceService {
    InvoiceResponseDto saveInvoice(InvoiceRequestDto request);
    List<InvoiceResponseDto> getAllInvoices();
    InvoiceResponseDto getInvoiceById(Long id);
    InvoiceResponseDto updateInvoice(Long id, InvoiceRequestDto request);
    void deleteInvoice(Long id);
}