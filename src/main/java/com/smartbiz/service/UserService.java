package com.smartbiz.service;

import com.smartbiz.dto.UserRequestDto;
import com.smartbiz.dto.UserResponseDto;

import java.util.List;

public interface UserService {
    UserResponseDto createUser(UserRequestDto request);
    List<UserResponseDto> getAllUsers();
    UserResponseDto getUserById(Long id);
    UserResponseDto updateUser(Long id, UserRequestDto request);
    void deleteUser(Long id);
}