// src/main/java/com/cogniwritepro/repository/ContentRequestRepository.java
package com.cogniwritepro.repository;

import com.cogniwritepro.model.ContentRequest;
import org.springframework.data.jpa.repository.EntityGraph; // Import EntityGraph
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Repository
public interface ContentRequestRepository extends JpaRepository<ContentRequest, Long> {
    // Method to find all content requests ordered by creation date descending
    List<ContentRequest> findAllByOrderByCreatedAtDesc();

    // Method to find content requests for a specific user, ordered by creation date descending
    List<ContentRequest> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Use @EntityGraph to eagerly fetch generatedContents and their nested metrics
    @EntityGraph(attributePaths = {"generatedContents", "generatedContents.metrics"})
    @Override // Override findById to apply the EntityGraph
    Optional<ContentRequest> findById(Long id);



    // You might also want to eagerly fetch audienceProfile and user if they are always needed
    // @EntityGraph(attributePaths = {"generatedContents", "generatedContents.metrics", "audienceProfile", "user"})
    // Optional<ContentRequest> findById(Long id);
}
