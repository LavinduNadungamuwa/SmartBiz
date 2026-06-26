package com.smartbiz.repository;

import com.smartbiz.entity.SaleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {
    List<SaleItem> findBySaleBusinessId(Long businessId);

    @Transactional
    @Modifying
    @Query("DELETE FROM SaleItem si WHERE si.sale.id = :saleId")
    void deleteBySaleId(@Param("saleId") Long saleId);
}