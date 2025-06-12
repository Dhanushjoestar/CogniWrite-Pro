// File: src/main/java/com/cogniwritepro/dto/AudienceProfileDTO.java
package com.cogniwritepro.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AudienceProfileDTO {
    private Long id;
    private String profileName; // Added for better identification
    private String ageGroup;
    private String personaType;
    private String tone;
}