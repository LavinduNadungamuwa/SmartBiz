package com.smartbiz.dto;

import com.smartbiz.enums.InvoiceStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class InvoiceRequestDto {
    private String invoiceNumber;
    private LocalDateTime dueDate;
    private InvoiceStatus status;
    private Long saleId;
}