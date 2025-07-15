// File: src/main/java/com/cogniwritepro/dto/ContentRequestDTO.java
package com.cogniwritepro.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContentRequestDTO {
    private Long id;
    private String prompt;
    private String targetPlatform;
    private Long audienceProfileId;
    private Long userId;
    private LocalDateTime createdAt;

    // NEW: Generation parameters
    private Double temperature = 0.7;
    private String model = "gemini";

    // Optional nested DTOs (for responses only)
    private AudienceProfileDTO audienceProfile;
    private UserDTO user;

    // CHANGED: Now returns list of content
    private List<GeneratedContentDTO> generatedContents;
}