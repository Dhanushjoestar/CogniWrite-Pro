package com.cogniwritepro.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// You might add validation annotations here like @NotBlank, @Email, @Size later
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String role; // Optional: If you allow clients to specify role during registration
}