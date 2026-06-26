package com.smartbiz.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponseDto {
    private String token;
    private String message;
    private Long userId;
    private String email;
    private Long businessId;
    private String businessName;
}