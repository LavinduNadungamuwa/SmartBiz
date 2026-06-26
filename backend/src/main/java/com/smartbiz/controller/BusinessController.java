package com.smartbiz.controller;

import com.smartbiz.dto.BusinessResponseDto;
import com.smartbiz.entity.Business;
import com.smartbiz.entity.User;
import com.smartbiz.repository.BusinessRepository;
import com.smartbiz.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/businesses")
@CrossOrigin
@RequiredArgsConstructor
public class BusinessController {

    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;

    @GetMapping("/me")
    public ResponseEntity<BusinessResponseDto> getCurrentBusiness() {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Business business = user.getBusiness();

        BusinessResponseDto response = BusinessResponseDto.builder()
                .id(business.getId())
                .businessName(business.getBusinessName())
                .email(business.getEmail())
                .phone(business.getPhone())
                .address(business.getAddress())
                .build();

        return ResponseEntity.ok(response);
    }
}