package com.smartbiz.service.impl;

import com.smartbiz.dto.UserRequestDto;
import com.smartbiz.dto.UserResponseDto;
import com.smartbiz.entity.Business;
import com.smartbiz.entity.User;
import com.smartbiz.enums.UserRole;
import com.smartbiz.exception.AccessDeniedException;
import com.smartbiz.exception.BadRequestException;
import com.smartbiz.exception.ResourceNotFoundException;
import com.smartbiz.repository.UserRepository;
import com.smartbiz.service.UserService;
import com.smartbiz.util.SecurityHelper;
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

        User loggedInUser =
                SecurityHelper.getLoggedInUser(userRepository);

        Business business = loggedInUser.getBusiness();

        // Prevent creating admins
        if (request.getRole() == UserRole.ADMIN) {
            throw new BadRequestException(
                    "Cannot create another ADMIN from this endpoint"
            );
        }

        // Prevent duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException(
                    "Email already exists"
            );
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

        User loggedInUser =
                SecurityHelper.getLoggedInUser(userRepository);

        Long businessId =
                loggedInUser.getBusiness().getId();

        return userRepository.findByBusiness_Id(businessId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public UserResponseDto getUserById(Long id) {

        User loggedInUser =
                SecurityHelper.getLoggedInUser(userRepository);

        Long businessId =
                loggedInUser.getBusiness().getId();

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        if (!user.getBusiness().getId().equals(businessId)) {
            throw new AccessDeniedException("Access denied");
        }

        return mapToDto(user);
    }

    @Override
    public UserResponseDto updateUser(Long id,
                                      UserRequestDto request) {

        User loggedInUser =
                SecurityHelper.getLoggedInUser(userRepository);

        Long businessId =
                loggedInUser.getBusiness().getId();

        User existing = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        if (!existing.getBusiness().getId().equals(businessId)) {
            throw new AccessDeniedException("Access denied");
        }

        if (existing.getRole() == UserRole.ADMIN) {
            throw new BadRequestException(
                    "Admin user cannot be modified here"
            );
        }

        // Prevent duplicate email
        if (!existing.getEmail().equals(request.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {

            throw new BadRequestException(
                    "Email already exists"
            );
        }

        existing.setFullName(request.getFullName());
        existing.setEmail(request.getEmail());
        existing.setPhone(request.getPhone());
        existing.setRole(request.getRole());

        if (request.getPassword() != null
                && !request.getPassword().isBlank()) {

            existing.setPassword(
                    passwordEncoder.encode(request.getPassword())
            );
        }

        User updated = userRepository.save(existing);

        return mapToDto(updated);
    }

    @Override
    public void deleteUser(Long id) {

        User loggedInUser =
                SecurityHelper.getLoggedInUser(userRepository);

        Long businessId =
                loggedInUser.getBusiness().getId();

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        if (!user.getBusiness().getId().equals(businessId)) {
            throw new AccessDeniedException("Access denied");
        }

        if (user.getRole() == UserRole.ADMIN) {
            throw new BadRequestException(
                    "Admin user cannot be deleted here"
            );
        }

        userRepository.deleteById(id);
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