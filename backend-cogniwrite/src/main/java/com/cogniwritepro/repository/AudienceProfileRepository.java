// File: src/main/java/com/cogniwritepro/repository/AudienceProfileRepository.java
package com.cogniwritepro.repository;

import com.cogniwritepro.model.AudienceProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AudienceProfileRepository extends JpaRepository<AudienceProfile, Long> {
    Optional<AudienceProfile> findByProfileName(String profileName);
}
