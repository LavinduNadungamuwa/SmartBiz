package com.smartbiz.service.impl;

import com.smartbiz.dto.AuthResponseDto;
import com.smartbiz.dto.LoginRequestDto;
import com.smartbiz.dto.RegisterRequestDto;
import com.smartbiz.entity.Business;
import com.smartbiz.entity.User;
import com.smartbiz.enums.SubscriptionPlan;
import com.smartbiz.enums.UserRole;
import com.smartbiz.repository.BusinessRepository;
import com.smartbiz.repository.UserRepository;
import com.smartbiz.security.JwtService;
import com.smartbiz.service.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthServiceImpl(UserRepository userRepository,
                           BusinessRepository businessRepository,
                           PasswordEncoder passwordEncoder,
                           JwtService jwtService) {
        this.userRepository = userRepository;
        this.businessRepository = businessRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Override
    public AuthResponseDto register(RegisterRequestDto request) {

        // Prevent duplicate email registrations
        if (userRepository.existsByEmail(request.getEmail())) {
            return new AuthResponseDto(
                    null,
                    "Email already registered",
                    null,
                    null,
                    null,
                    null
            );
        }

        // Create business
        Business business = Business.builder()
                .businessName(request.getBusinessName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .subscriptionPlan(SubscriptionPlan.FREE)
                .build();

        businessRepository.save(business);

        // Default role
        UserRole assignedRole = UserRole.USER;

        // Create user
        User user = User.builder()
                .fullName(request.getOwnerName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(UserRole.ADMIN)
                .business(business)
                .build();

        userRepository.save(user);

        // Generate token
        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponseDto(
                token,
                "Registration successful",

                user.getId(),
                user.getEmail(),

                business.getId(),
                business.getBusinessName()
        );
    }

    @Override
    public AuthResponseDto login(LoginRequestDto request) {

        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        // User does not exist
        if (user == null) {
            return new AuthResponseDto(
                    null,
                    "Invalid email or password",
                    null,
                    null,
                    null,
                    null
            );
        }

        // Validate password
        boolean passwordMatches = passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        );

        // Wrong password
        if (!passwordMatches) {
            return new AuthResponseDto(
                    null,
                    "Invalid email or password",
                    null,
                    null,
                    null,
                    null
            );
        }

        // Generate JWT token
        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponseDto(
                token,
                "Login successful",

                user.getId(),
                user.getEmail(),

                user.getBusiness().getId(),
                user.getBusiness().getBusinessName()
        );
    }
}