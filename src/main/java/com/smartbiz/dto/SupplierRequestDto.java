package com.smartbiz.dto;

import lombok.Data;

@Data
public class SupplierRequestDto {
    private String supplierName;
    private String email;
    private String phone;
    private String address;
    private Long businessId;
}