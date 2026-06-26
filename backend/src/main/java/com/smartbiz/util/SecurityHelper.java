package com.smartbiz.util;

import com.smartbiz.entity.User;
import com.smartbiz.exception.UnauthorizedException;
import com.smartbiz.repository.UserRepository;
import com.smartbiz.security.SecurityUtils;

public class SecurityHelper {

    private SecurityHelper() {
    }

    public static User getLoggedInUser(UserRepository userRepository) {
        String email = SecurityUtils.getCurrentUserEmail();

        if (email == null) {
            throw new UnauthorizedException("No authenticated user found");
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Logged-in user not found"));
    }
}