package com.smartbiz.service;

import com.smartbiz.dto.AuthResponseDto;
import com.smartbiz.dto.LoginRequestDto;
import com.smartbiz.dto.RegisterRequestDto;

public interface AuthService {
    AuthResponseDto register(RegisterRequestDto request);
    AuthResponseDto login(LoginRequestDto request);
}