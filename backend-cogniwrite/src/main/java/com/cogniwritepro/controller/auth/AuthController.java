// src/main/java/com/cogniwritepro/controller/auth/AuthController.java
package com.cogniwritepro.controller.auth;

import com.cogniwritepro.dto.AuthResponseDTO;
import com.cogniwritepro.dto.LoginDTO;
import com.cogniwritepro.dto.RegisterDTO;
import com.cogniwritepro.model.User;
import com.cogniwritepro.repository.UserRepository;
import com.cogniwritepro.security.JwtGenerator; // Import JwtGenerator
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager; // Import AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationManager authenticationManager; // Inject AuthenticationManager
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtGenerator jwtGenerator; // Inject JwtGenerator

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterDTO registerDTO) {
        log.info("Attempting to register user: {}", registerDTO.getEmail());
        if (userRepository.existsByEmail(registerDTO.getEmail())) {
            log.warn("Registration failed: Email already taken - {}", registerDTO.getEmail());
            return new ResponseEntity<>("Email is taken!", HttpStatus.BAD_REQUEST);
        }

        User user = new User();
        user.setName(registerDTO.getName());
        user.setEmail(registerDTO.getEmail());
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        user.setRole("USER"); // Default role for new users

        userRepository.save(user);
        log.info("User registered successfully: {}", registerDTO.getEmail());
        return new ResponseEntity<>("User registered success!", HttpStatus.OK);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginDTO loginDTO) {
        log.info("Attempting to log in user: {}", loginDTO.getEmail());
        try {
            // Authenticate user credentials
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginDTO.getEmail(),
                            loginDTO.getPassword()));

            // Set authentication in SecurityContext (optional for stateless, but good practice)
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Generate JWT token
            String token = jwtGenerator.generateToken(authentication);

            // NEW: Retrieve the User entity to get the ID and name
            User user = userRepository.findByEmail(loginDTO.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found after authentication"));

            log.info("User logged in successfully and token generated for: {}", loginDTO.getEmail());
            // NEW: Return AuthResponseDTO with token, message, userId, and userName
            return new ResponseEntity<>(new AuthResponseDTO(token, "Login successful", user.getId(), user.getName()), HttpStatus.OK);
        } catch (Exception e) {
            log.error("Login failed for user {}: {}", loginDTO.getEmail(), e.getMessage());
            return new ResponseEntity<>(new AuthResponseDTO(null, "Invalid credentials"), HttpStatus.UNAUTHORIZED);
        }
    }
}
