// File: src/main/java/com/cogniwritepro/model/User.java
package com.cogniwritepro.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users") // Renamed from default 'user' to avoid potential SQL keyword conflicts
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email; // Using email as a unique identifier for login

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String password; // Store hashed password, not plain text!

    @Column(nullable = false)
    private String role; // e.g., "ROLE_USER", "ROLE_ADMIN"

    // Optional: You might want to add relationships or audit fields later
    // e.g., @OneToMany(mappedBy = "user") List<ContentRequest> contentRequests;

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", email='" + email + '\'' +
                ", name='" + name + '\'' +
                ", role='" + role + '\'' +
                '}';
    }
}
