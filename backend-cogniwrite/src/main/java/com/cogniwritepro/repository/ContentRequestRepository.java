// File: src/main/java/com/cogniwritepro/repository/ContentRequestRepository.java
package com.cogniwritepro.repository;

import com.cogniwritepro.model.ContentRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContentRequestRepository extends JpaRepository<ContentRequest, Long> {
    // Custom methods if needed, e.g., find all requests by a user
    List<ContentRequest> findByUserId(Long userId);
}
