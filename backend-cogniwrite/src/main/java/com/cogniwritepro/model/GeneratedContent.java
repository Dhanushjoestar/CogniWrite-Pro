// File: src/main/java/com/cogniwritepro/model/GeneratedContent.java
package com.cogniwritepro.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "generated_contents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GeneratedContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String content;


    // One-to-one relationship with ContentRequest (each request generates one content)
    // Or One-to-many if a request can generate multiple versions
    // For now, let's assume one request produces one primary generated content.
    @OneToOne(fetch = FetchType.LAZY) // LAZY fetching for performance
    @JoinColumn(name = "request_id", nullable = false, unique = true) // FK to ContentRequest
    private ContentRequest contentRequest;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist // JPA lifecycle callback
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @Override
    public String toString() {
        return "GeneratedContent{" +
                "id=" + id +
                ", contentSnippet='" + content.substring(0, Math.min(content.length(), 50)) + "...'" + // Show only snippet
                ", requestId=" + (contentRequest != null ? contentRequest.getId() : "null") +
                ", createdAt=" + createdAt +
                '}';
    }
}