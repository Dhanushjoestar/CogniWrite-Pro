// src/main/java/com/cogniwritepro/dto/AuthResponseDTO.java
package com.cogniwritepro.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {
    private String accessToken;
    private String tokenType = "Bearer "; // Default token type
    private String message; // Optional: for error messages or success status
    private Long userId; // NEW: Add userId to the response DTO
    private String userName; // NEW: Add userName for convenience on frontend

    public AuthResponseDTO(String accessToken) {
        this.accessToken = accessToken;
    }

    public AuthResponseDTO(String accessToken, String message) {
        this.accessToken = accessToken;
        this.message = message;
    }

    // NEW: Constructor to include userId and userName
    public AuthResponseDTO(String accessToken, String message, Long userId, String userName) {
        this.accessToken = accessToken;
        this.message = message;
        this.userId = userId;
        this.userName = userName;
    }
}
