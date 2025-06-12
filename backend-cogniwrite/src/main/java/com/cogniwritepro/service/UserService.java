package com.cogniwritepro.service;

import com.cogniwritepro.dto.UserDTO;
import com.cogniwritepro.dto.RegisterRequest; // Add this import
import com.cogniwritepro.model.User;
import com.cogniwritepro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder; // We'll add this later if using Spring Security

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    // private final PasswordEncoder passwordEncoder; // Uncomment if you add Spring Security bean

    @Transactional
    // Changed the input parameter type from UserDTO to RegisterRequest
    public UserDTO createUser(RegisterRequest registerRequest) {
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            throw new IllegalArgumentException("User with email '" + registerRequest.getEmail() + "' already exists.");
        }

        User user = new User();
        user.setName(registerRequest.getName());
        user.setEmail(registerRequest.getEmail());
        user.setRole(registerRequest.getRole() != null ? registerRequest.getRole() : "ROLE_USER"); // Default role

        // Important: Encode password before saving!
        // If you've configured PasswordEncoder as a Spring bean:
        // user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        // For now, without Spring Security/PasswordEncoder setup (TEMPORARY - NOT SECURE):
        if (registerRequest.getPassword() == null || registerRequest.getPassword().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be empty.");
        }
        user.setPassword(registerRequest.getPassword()); // !!! DANGER: This is NOT SECURE for production. Use PasswordEncoder.

        User savedUser = userRepository.save(user);
        return convertEntityToDto(savedUser);
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return convertEntityToDto(user);
    }

    public List<UserDTO> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(this::convertEntityToDto)
                .collect(Collectors.toList());
    }

    public Optional<User> findUserEntityByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public UserDTO getUserByEmail(String email) { // This method still returns DTO for public display
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return convertEntityToDto(user);
    }

    @Transactional
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        existingUser.setName(userDTO.getName());
        existingUser.setEmail(userDTO.getEmail());
        existingUser.setRole(userDTO.getRole());
        // Do not update password here unless explicitly handled with old password check etc.
        // If password is part of update, it would come from a specific UpdatePasswordRequest DTO
        // and be hashed before saving.

        User updatedUser = userRepository.save(existingUser);
        return convertEntityToDto(updatedUser);
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    // --- Helper methods for DTO-Entity conversion ---
    private UserDTO convertEntityToDto(User entity) {
        UserDTO dto = new UserDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setEmail(entity.getEmail());
        dto.setRole(entity.getRole());
        // Do NOT set password here for security reasons when returning to client
        return dto;
    }
}