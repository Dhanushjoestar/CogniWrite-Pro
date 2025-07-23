package com.cogniwritepro.repository;

import com.cogniwritepro.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Custom method to find a user by email, useful for authentication
    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);
}
