package com.smartbiz.dto;

import lombok.Data;

@Data
public class RegisterRequestDto {
    private String businessName;
    private String ownerName;
    private String email;
    private String password;
    private String phone;
    private String address;
}