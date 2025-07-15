// File: src/main/java/com/cogniwritepro/repository/GeneratedContentRepository.java
package com.cogniwritepro.repository;

import com.cogniwritepro.model.GeneratedContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GeneratedContentRepository extends JpaRepository<GeneratedContent, Long> {
    // Find by request ID (now returns list instead of single result)
    List<GeneratedContent> findByContentRequestId(Long requestId);

    // New query methods for variant filtering
    List<GeneratedContent> findByContentRequestIdAndIsVariantA(Long requestId, boolean isVariantA);
    Optional<GeneratedContent> findByContentRequestIdAndModelUsed(Long requestId, String model);

    // For deletion
    void deleteByContentRequestId(Long requestId);
}