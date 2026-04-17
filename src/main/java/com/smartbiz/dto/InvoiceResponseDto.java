package com.smartbiz.dto;

import com.smartbiz.enums.InvoiceStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class InvoiceResponseDto {
    private Long id;
    private String invoiceNumber;
    private LocalDateTime issueDate;
    private LocalDateTime dueDate;
    private BigDecimal totalAmount;
    private InvoiceStatus status;
    private Long saleId;
}