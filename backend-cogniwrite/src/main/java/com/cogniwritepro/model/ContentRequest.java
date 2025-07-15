package com.cogniwritepro.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    @Column(nullable = false, length = 1000)
    private String prompt;

    @Column(nullable = false)
    private String targetPlatform;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "audience_profile_id", nullable = false)
    private AudienceProfile audienceProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private Double temperature = 0.7;

    @Column(nullable = false, length = 50)
    private String model = "gemini";

    // CHANGED: Added orphanRemoval and cascade settings
    @OneToMany(
            mappedBy = "contentRequest",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<GeneratedContent> generatedContents = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Helper method to add generated content
    public void addGeneratedContent(GeneratedContent content) {
        generatedContents.add(content);
        content.setContentRequest(this);
    }

    @Override
    public String toString() {
        return "ContentRequest{" +
                "id=" + id +
                ", prompt='" + prompt + '\'' +
                ", targetPlatform='" + targetPlatform + '\'' +
                ", createdAt=" + createdAt +
                ", temperature=" + temperature +
                ", model='" + model + '\'' +
                ", audienceProfileId=" + (audienceProfile != null ? audienceProfile.getId() : "null") +
                ", userId=" + (user != null ? user.getId() : "null") +
                '}';
    }
}