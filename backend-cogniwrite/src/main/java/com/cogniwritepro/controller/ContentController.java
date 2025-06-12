package com.cogniwritepro.controller;

import com.cogniwritepro.dto.ContentRequestDTO;
import com.cogniwritepro.service.ContentRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/content")
@RequiredArgsConstructor
@Slf4j // Add this for logging
public class ContentController {

    private final ContentRequestService contentRequestService;

    @PostMapping("/generate")
    public ResponseEntity<?> generateContent(@RequestBody ContentRequestDTO requestDTO) {
        try {
            log.info("Received content generation request: {}", requestDTO);

            // Validate the request
            if (requestDTO.getPrompt() == null || requestDTO.getPrompt().trim().isEmpty()) {
                log.error("Empty prompt received");
                Map<String, String> error = new HashMap<>();
                error.put("error", "Prompt cannot be empty");
                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
            }

            // Generate content
            ContentRequestDTO generatedContentDTO = contentRequestService.createAndGenerateContent(requestDTO).block();

            log.info("Content generated successfully with ID: {}", generatedContentDTO.getId());
            return new ResponseEntity<>(generatedContentDTO, HttpStatus.CREATED);

        } catch (IllegalArgumentException e) {
            log.error("Bad request: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid request: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);

        } catch (RuntimeException e) {
            log.error("Runtime exception during content generation: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to generate content: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);

        } catch (Exception e) {
            log.error("Unexpected error during content generation: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "An unexpected error occurred");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContentRequestDTO> getContentById(@PathVariable Long id) {
        try {
            ContentRequestDTO content = contentRequestService.getContentRequestById(id);
            return ResponseEntity.ok(content);
        } catch (RuntimeException e) {
            log.error("Content not found with ID: {}", id, e);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ContentRequestDTO>> getContentByUserId(@PathVariable Long userId) {
        List<ContentRequestDTO> contents = contentRequestService.getContentRequestsByUserId(userId);
        if (contents.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(contents);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContent(@PathVariable Long id) {
        try {
            contentRequestService.deleteContentRequest(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("Failed to delete content with ID: {}", id, e);
            return ResponseEntity.notFound().build();
        }
    }
}