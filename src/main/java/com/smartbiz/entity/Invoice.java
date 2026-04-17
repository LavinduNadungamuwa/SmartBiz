package com.smartbiz.entity;

import com.smartbiz.enums.InvoiceStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String invoiceNumber;

    private LocalDateTime issueDate;

    private LocalDateTime dueDate;

    @Column(nullable = false)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    private InvoiceStatus status;

    @OneToOne
    @JoinColumn(name = "sale_id", nullable = false, unique = true)
    private Sale sale;

    @PrePersist
    public void prePersist() {
        if (this.issueDate == null) {
            this.issueDate = LocalDateTime.now();
        }
    }
}