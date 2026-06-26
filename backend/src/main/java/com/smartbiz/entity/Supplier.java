package com.smartbiz.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "suppliers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String supplierName;

    @Column(unique = true)
    private String email;

    private String phone;
    private String address;
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "business_id", nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Business business;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}