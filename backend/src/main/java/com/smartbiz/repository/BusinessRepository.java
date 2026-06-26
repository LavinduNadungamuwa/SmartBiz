package com.smartbiz.repository;

import com.smartbiz.entity.Business;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BusinessRepository extends JpaRepository<Business, Long> {
//    Optional<Business> findByEmail(String email);
}