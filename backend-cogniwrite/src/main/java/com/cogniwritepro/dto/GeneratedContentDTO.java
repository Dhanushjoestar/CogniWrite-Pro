// File: src/main/java/com/cogniwritepro/dto/GeneratedContentDTO.java
package com.cogniwritepro.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GeneratedContentDTO {
    private Long id;
    private String content;
    private Long requestId;
    private LocalDateTime createdAt;
    private ContentMetricsDTO metrics;

    @JsonProperty("isVariantA")
    private boolean variantA;

    private String modelUsed;
    private double temperatureUsed;
}