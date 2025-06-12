// File: src/main/java/com/cogniwritepro/repository/GeneratedContentRepository.java
package com.cogniwritepro.repository;

import com.cogniwritepro.model.GeneratedContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GeneratedContentRepository extends JpaRepository<GeneratedContent, Long> {
    // Custom method to find generated content by its associated request ID
    Optional<GeneratedContent> findByContentRequestId(Long requestId);
}