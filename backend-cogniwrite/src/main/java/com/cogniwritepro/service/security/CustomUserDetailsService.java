// src/main/java/com/cogniwritepro/service/security/CustomUserDetailsService.java
package com.cogniwritepro.service.security;

import com.cogniwritepro.model.User;
import com.cogniwritepro.repository.UserRepository;
import com.cogniwritepro.security.CustomUserDetails; // NEW: Import CustomUserDetails
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private UserRepository userRepository;

    @Autowired
    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        // MODIFIED: Return CustomUserDetails instead of generic Spring User
        return CustomUserDetails.build(user);
    }

}
