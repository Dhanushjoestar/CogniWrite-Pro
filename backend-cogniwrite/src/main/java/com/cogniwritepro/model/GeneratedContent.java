package com.cogniwritepro.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "generated_contents", uniqueConstraints = {
        // CHANGED: Updated to composite unique constraint
        @UniqueConstraint(
                name = "uk_request_variant",
                columnNames = {"request_id", "is_variant_a"}
        )
})
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

    // Changed to ManyToOne: one request can have multiple generated contents
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private ContentRequest contentRequest;

    @Embedded
    private ContentMetrics metrics;

    // CHANGED: Made naming consistent
    @Column(name = "is_variant_a", nullable = false)
    private boolean isVariantA = true;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @Column(name = "model_used", nullable = false)
    private String modelUsed = "gemini";

    @Column(name = "temperature_used", nullable = false)
    private double temperatureUsed = 0.7;

    // CHANGED: Added explicit getter for JPA field access


    @Override
    public String toString() {
        return "GeneratedContent{" +
                "id=" + id +
                ", contentSnippet='" + (content != null ? content.substring(0, Math.min(content.length(), 50)) + "..." : "") +
                ", requestId=" + (contentRequest != null ? contentRequest.getId() : "null") +
                ", modelUsed='" + modelUsed + '\'' +
                ", temperatureUsed=" + temperatureUsed +
                ", isVariantA=" + isVariantA +
                ", createdAt=" + createdAt +
                '}';
    }
}
