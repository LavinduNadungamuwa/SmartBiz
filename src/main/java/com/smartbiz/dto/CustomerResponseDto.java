package com.smartbiz.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CustomerResponseDto {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private Long businessId;
}