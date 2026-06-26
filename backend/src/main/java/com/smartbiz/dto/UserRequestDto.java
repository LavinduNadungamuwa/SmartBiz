package com.smartbiz.dto;

import com.smartbiz.enums.UserRole;
import lombok.Data;

@Data
public class UserRequestDto {
    private String fullName;
    private String email;
    private String password;
    private String phone;
    private UserRole role;
}