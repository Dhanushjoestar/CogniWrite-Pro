package com.cogniwritepro.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ABTestResponseDTO {
    private GeneratedContentDTO variantA;
    private GeneratedContentDTO variantB;
    private String comparisonSummary;
}