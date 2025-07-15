// File: src/main/java/com/cogniwritepro/model/ContentMetrics.java
package com.cogniwritepro.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContentMetrics {

    @Column(name = "readability_score")
    private Double readabilityScore;

    @Column(name = "clarity_score")
    private Double clarityScore;

    @Column(name = "engagement_prediction")
    private Integer engagementPrediction;

    @Column(name = "platform_optimization")
    private Integer platformOptimization;

    @Column(name = "optimization_tips", length = 1000)
    private String optimizationTips;
}