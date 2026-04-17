package com.smartbiz.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SupplierResponseDto {
    private Long id;
    private String supplierName;
    private String email;
    private String phone;
    private String address;
    private Long businessId;
}