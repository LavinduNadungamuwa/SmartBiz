package com.smartbiz.dto;

import lombok.Data;

@Data
public class CustomerRequestDto {
    private String fullName;
    private String email;
    private String phone;
    private Long businessId;
}