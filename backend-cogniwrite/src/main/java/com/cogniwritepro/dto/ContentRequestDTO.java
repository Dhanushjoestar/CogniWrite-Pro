// com.cogniwritepro.dto.ContentRequestDTO.java
package com.cogniwritepro.dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentRequestDTO {
    private Long id; // This will be null for new requests, set by DB on save
    private String prompt;
    private String targetPlatform; // MODIFIED: Renamed from 'platform' to 'targetPlatform'
    private String audience; // Matches frontend 'audience' field directly (e.g., "tech_enthusiasts")
    private String model;
    private Double temperature;
    private Long userId; // Assuming userId might be passed or derived, keeping it nullable for now
    private Long audienceProfileId; // NEW: Added audienceProfileId field


    private AudienceProfileDTO audienceProfile;
    private UserDTO user;
    private LocalDateTime createdAt;
    private List<GeneratedContentDTO> generatedContents;


}
