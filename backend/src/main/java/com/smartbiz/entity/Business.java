package com.smartbiz.entity;

import com.smartbiz.enums.SubscriptionPlan;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "businesses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Business {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String businessName;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;
    private String address;

    @Enumerated(EnumType.STRING)
    private SubscriptionPlan subscriptionPlan;

    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "business", cascade = CascadeType.ALL)
    private List<User> users;

//    import com.fasterxml.jackson.annotation.JsonIgnore;
//
//    @OneToMany(mappedBy = "business")
//    @JsonIgnore
//    private List<Customer> customers;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}