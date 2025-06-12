// File: src/main/java/com/cogniwritepro/model/AudienceProfile.java
package com.cogniwritepro.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "audience_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AudienceProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String ageGroup; // e.g., "18-24", "25-34", "35-50", "50+"

    @Column(nullable = false)
    private String personaType; // e.g., "Gen Z", "Tech Enthusiast", "Working Parent", "Small Business Owner"

    @Column(nullable = false)
    private String tone; // e.g., "Formal", "Friendly", "Informative", "Humorous", "Authoritative"

    @Column(nullable = false, unique = true) // To prevent duplicate identical profiles
    private String profileName; // e.g., "Young Tech Enthusiasts - Friendly Tone"

    // Optional: User who created this profile, if you want user-specific profiles
    // @ManyToOne
    // @JoinColumn(name = "user_id")
    // private User user;

    @Override
    public String toString() {
        return "AudienceProfile{" +
                "id=" + id +
                ", profileName='" + profileName + '\'' +
                ", ageGroup='" + ageGroup + '\'' +
                ", personaType='" + personaType + '\'' +
                ", tone='" + tone + '\'' +
                '}';
    }
}