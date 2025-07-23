// src/main/java/com/cogniwritepro/dto/ContentHistoryItemDTO.java
package com.cogniwritepro.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContentHistoryItemDTO {
    private Long id;
    private String prompt;
    private LocalDateTime createdAt;
    private String type; // NEW: Added type to distinguish between 'generate' and 'ab-test'
}
