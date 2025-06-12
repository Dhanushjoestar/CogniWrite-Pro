// File: src/main/java/com/cogniwritepro/model/ContentRequest.java
package com.cogniwritepro.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "content_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContentRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1000) // Adjust length as needed for prompts
    private String prompt;

    @Column(nullable = false)
    private String targetPlatform; // e.g., "Twitter", "LinkedIn", "Blog Post", "Email Marketing"

    // Many-to-one relationship with AudienceProfile
    @ManyToOne(fetch = FetchType.LAZY) // LAZY fetching is good for performance
    @JoinColumn(name = "audience_profile_id", nullable = false) // FK column name
    private AudienceProfile audienceProfile;

    // Optional: User who made the request
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true) // Can be null if requests are public or anonymous
    private User user;

    @Column(nullable = false)
    private LocalDateTime createdAt; // Timestamp of when the request was made

    @PrePersist // JPA lifecycle callback: sets createdAt before persisting the entity
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @Override
    public String toString() {
        return "ContentRequest{" +
                "id=" + id +
                ", prompt='" + prompt + '\'' +
                ", targetPlatform='" + targetPlatform + '\'' +
                ", createdAt=" + createdAt +
                ", audienceProfileId=" + (audienceProfile != null ? audienceProfile.getId() : "null") +
                ", userId=" + (user != null ? user.getId() : "null") +
                '}';
    }
}