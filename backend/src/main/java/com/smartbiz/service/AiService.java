package com.smartbiz.service;

import com.smartbiz.dto.AiResponseDto;

public interface AiService {
    AiResponseDto askQuestion(String question);
}