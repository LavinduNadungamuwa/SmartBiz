package com.smartbiz.controller;

import com.smartbiz.dto.AiRequestDto;
import com.smartbiz.dto.AiResponseDto;
import com.smartbiz.service.AiService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @PostMapping("/ask")
    public AiResponseDto askQuestion(@Valid @RequestBody AiRequestDto request) {
        return aiService.askQuestion(request.getQuestion());
    }
}