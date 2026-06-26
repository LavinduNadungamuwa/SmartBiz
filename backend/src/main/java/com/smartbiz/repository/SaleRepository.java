package com.smartbiz.repository;

import com.smartbiz.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    List<Sale> findByBusinessId(Long businessId);

    @Query("""
        SELECT COALESCE(SUM(s.totalAmount), 0)
        FROM Sale s
        WHERE s.business.id = :businessId
    """)
    BigDecimal getTotalRevenueByBusinessId(@Param("businessId") Long businessId);

    @Query("""
    SELECT DISTINCT s
    FROM Sale s
    LEFT JOIN FETCH s.saleItems si
    LEFT JOIN FETCH si.product
    WHERE s.business.id = :businessId
""")
    List<Sale> findByBusinessIdWithItems(@Param("businessId") Long businessId);
}