package com.smartbiz.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BusinessResponseDto {

    private Long id;
    private String businessName;
    private String email;
    private String phone;
    private String address;
}

