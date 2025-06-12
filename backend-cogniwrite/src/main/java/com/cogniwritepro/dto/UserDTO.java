// File: src/main/java/com/cogniwritepro/dto/UserDTO.java
package com.cogniwritepro.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private String role;
    // Password should NOT be returned in a DTO for security.
    // For creation/login, you might have separate DTOs like RegisterRequest/LoginRequest
}