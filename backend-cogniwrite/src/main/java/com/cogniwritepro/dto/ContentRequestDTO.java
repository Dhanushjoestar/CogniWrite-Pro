// File: src/main/java/com/cogniwritepro/dto/ContentRequestDTO.java
package com.cogniwritepro.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContentRequestDTO {
    private Long id; // Will be null for new requests
    private String prompt;
    private String targetPlatform;
    private Long audienceProfileId; // Only send the ID from the frontend
    private Long userId; // Only send the ID from the frontend (optional, depending on auth)
    private LocalDateTime createdAt; // Populated by backend

    // Nested DTO for response if needed (optional)
    private AudienceProfileDTO audienceProfile;
    private UserDTO user;
    private GeneratedContentDTO generatedContent; // For retrieval responses
}