// File: src/main/java/com/cogniwritepro/dto/ContentMetricsDTO.java
package com.cogniwritepro.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContentMetricsDTO {
    private Double readabilityScore;
    private Double clarityScore;
    private Integer engagementPrediction;
    private Integer platformOptimization;
    private String optimizationTips;
}