package com.smartbiz.dto;

import com.smartbiz.enums.UserRole;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponseDto {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private UserRole role;
    private Long businessId;
}