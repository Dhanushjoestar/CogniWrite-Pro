// File: src/main/java/com/cogniwritepro/controller/AudienceProfileController.java
package com.cogniwritepro.controller;

import com.cogniwritepro.dto.AudienceProfileDTO;
import com.cogniwritepro.service.AudienceProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audience")
@RequiredArgsConstructor
public class AudienceProfileController {

    private final AudienceProfileService audienceProfileService;

    /**
     * POST /api/audience
     * Creates a new audience profile.
     */
    @PostMapping
    public ResponseEntity<AudienceProfileDTO> createAudienceProfile(@RequestBody AudienceProfileDTO audienceProfileDTO) {
        try {
            AudienceProfileDTO createdProfile = audienceProfileService.createAudienceProfile(audienceProfileDTO);
            return new ResponseEntity<>(createdProfile, HttpStatus.CREATED); // 201 Created
        } catch (IllegalArgumentException e) {
            // e.g., if profile name already exists
            return ResponseEntity.badRequest().build(); // 400 Bad Request
        }
    }

    /**
     * GET /api/audience
     * Retrieves all audience profiles.
     */
    @GetMapping
    public ResponseEntity<List<AudienceProfileDTO>> getAllAudienceProfiles() {
        List<AudienceProfileDTO> profiles = audienceProfileService.getAllAudienceProfiles();
        if (profiles.isEmpty()) {
            return ResponseEntity.noContent().build(); // 204 No Content
        }
        return ResponseEntity.ok(profiles); // 200 OK
    }

    /**
     * GET /api/audience/{id}
     * Retrieves a specific audience profile by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<AudienceProfileDTO> getAudienceProfileById(@PathVariable Long id) {
        try {
            AudienceProfileDTO profile = audienceProfileService.getAudienceProfileById(id);
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build(); // 404 Not Found
        }
    }

    /**
     * PUT /api/audience/{id}
     * Updates an existing audience profile.
     */
    @PutMapping("/{id}")
    public ResponseEntity<AudienceProfileDTO> updateAudienceProfile(@PathVariable Long id, @RequestBody AudienceProfileDTO audienceProfileDTO) {
        try {
            AudienceProfileDTO updatedProfile = audienceProfileService.updateAudienceProfile(id, audienceProfileDTO);
            return ResponseEntity.ok(updatedProfile); // 200 OK
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build(); // 404 Not Found
        }
    }

    /**
     * DELETE /api/audience/{id}
     * Deletes an audience profile.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAudienceProfile(@PathVariable Long id) {
        try {
            audienceProfileService.deleteAudienceProfile(id);
            return ResponseEntity.noContent().build(); // 204 No Content
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build(); // 404 Not Found
        }
    }
}
