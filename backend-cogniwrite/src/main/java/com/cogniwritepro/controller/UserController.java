package com.cogniwritepro.controller;

import com.cogniwritepro.dto.UserDTO;
import com.cogniwritepro.dto.LoginRequest;
import com.cogniwritepro.dto.RegisterRequest; // Add this import
import com.cogniwritepro.model.User;
import com.cogniwritepro.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * POST /api/users/register
     * Registers a new user.
     */
    @PostMapping("/register")
    public ResponseEntity<UserDTO> registerUser(@RequestBody RegisterRequest registerRequest) { // Changed parameter type here
        try {
            // Note: In a real app, UserService would hash the password.
            // The returned DTO would NOT contain password.
            UserDTO registeredUser = userService.createUser(registerRequest); // Pass the RegisterRequest
            return new ResponseEntity<>(registeredUser, HttpStatus.CREATED); // 201 Created
        } catch (IllegalArgumentException e) {
            // e.g., if email already exists, or password is empty
            return ResponseEntity.badRequest().body(new UserDTO(null, null, null, null)); // Return a dummy DTO or just 400
        } catch (Exception e) { // Catch more general exceptions for robustness
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * POST /api/users/login
     * Placeholder for user login.
     * In a real application, this would involve Spring Security,
     * checking credentials, and issuing a JWT token.
     */
    @PostMapping("/login")
    public ResponseEntity<String> loginUser(@RequestBody LoginRequest loginRequest) {
        try {
            User user = userService.findUserEntityByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("Invalid credentials"));

            // TEMPORARY & INSECURE: Directly comparing plaintext passwords.
            // Replace with: passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())
            if (user.getPassword().equals(loginRequest.getPassword())) {
                return ResponseEntity.ok("Login successful. Token: (placeholder_jwt_token)");
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }

    /**
     * GET /api/users/{id}
     * Retrieves user information by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        try {
            UserDTO user = userService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * PUT /api/users/{id}
     * Updates user information by ID.
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @RequestBody UserDTO userDTO) {
        try {
            UserDTO updatedUser = userService.updateUser(id, userDTO);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * DELETE /api/users/{id}
     * Deletes a user by ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}