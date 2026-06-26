package com.smartbiz.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

public class InvoiceNumberGenerator {

    private InvoiceNumberGenerator() {
    }

    public static String generateInvoiceNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String randomPart = UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        return "INV-" + timestamp + "-" + randomPart;
    }
}