package com.smartbiz.service.impl;

import com.smartbiz.dto.UserRequestDto;
import com.smartbiz.dto.UserResponseDto;
import com.smartbiz.entity.Business;
import com.smartbiz.entity.User;
import com.smartbiz.enums.UserRole;
import com.smartbiz.repository.UserRepository;
import com.smartbiz.security.SecurityUtils;
import com.smartbiz.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserResponseDto createUser(UserRequestDto request) {
        User loggedInUser = getLoggedInUser();
        Business business = loggedInUser.getBusiness();

        if (request.getRole() == UserRole.ADMIN) {
            throw new RuntimeException("Cannot create another ADMIN from this endpoint");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(request.getRole())
                .business(business)
                .build();

        User saved = userRepository.save(user);
        return mapToDto(saved);
    }

    @Override
    public List<UserResponseDto> getAllUsers() {
        User loggedInUser = getLoggedInUser();
        Long businessId = loggedInUser.getBusiness().getId();

        return userRepository.findByBusinessId(businessId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public UserResponseDto getUserById(Long id) {
        User loggedInUser = getLoggedInUser();
        Long businessId = loggedInUser.getBusiness().getId();

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getBusiness().getId().equals(businessId)) {
            throw new RuntimeException("Access denied");
        }

        return mapToDto(user);
    }

    @Override
    public UserResponseDto updateUser(Long id, UserRequestDto request) {
        User loggedInUser = getLoggedInUser();
        Long businessId = loggedInUser.getBusiness().getId();

        User existing = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!existing.getBusiness().getId().equals(businessId)) {
            throw new RuntimeException("Access denied");
        }

        if (existing.getRole() == UserRole.ADMIN) {
            throw new RuntimeException("Admin user cannot be modified here");
        }

        existing.setFullName(request.getFullName());
        existing.setEmail(request.getEmail());
        existing.setPhone(request.getPhone());
        existing.setRole(request.getRole());

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            existing.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        User updated = userRepository.save(existing);
        return mapToDto(updated);
    }

    @Override
    public void deleteUser(Long id) {
        User loggedInUser = getLoggedInUser();
        Long businessId = loggedInUser.getBusiness().getId();

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getBusiness().getId().equals(businessId)) {
            throw new RuntimeException("Access denied");
        }

        if (user.getRole() == UserRole.ADMIN) {
            throw new RuntimeException("Admin user cannot be deleted here");
        }

        userRepository.deleteById(id);
    }

    private User getLoggedInUser() {
        String email = SecurityUtils.getCurrentUserEmail();

        if (email == null) {
            throw new RuntimeException("No authenticated user found");
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Logged-in user not found"));
    }

    private UserResponseDto mapToDto(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .businessId(user.getBusiness().getId())
                .build();
    }
}