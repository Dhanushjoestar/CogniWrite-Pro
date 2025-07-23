package com.cogniwritepro.controller;

import com.cogniwritepro.dto.ContentHistoryItemDTO;
import com.cogniwritepro.dto.ContentMetricsDTO;
import com.cogniwritepro.dto.ContentRequestDTO;
import com.cogniwritepro.dto.ContentReviewDTO;
import com.cogniwritepro.model.ContentMetrics;
import com.cogniwritepro.security.CustomUserDetails; // NEW: Import CustomUserDetails
import com.cogniwritepro.service.ContentAnalysisService;
import com.cogniwritepro.service.ContentRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication; // NEW: Import Authentication
import org.springframework.security.core.context.SecurityContextHolder; // NEW: Import SecurityContextHolder
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/content")
@RequiredArgsConstructor
@Slf4j
public class ContentController {

    private final ContentRequestService contentRequestService;
    private final ContentAnalysisService contentAnalysisService;

    // NEW: Helper method to get authenticated user's ID
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && authentication.getPrincipal() instanceof CustomUserDetails) {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            return userDetails.getId(); // Return the actual user ID
        }
        return null; // No authenticated user or principal not CustomUserDetails
    }


    // Existing single content generation endpoint
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

            // MODIFIED: Set userId from authenticated context
            // Frontend might send userId, but backend should always verify/override from authenticated context for security
            requestDTO.setUserId(getCurrentUserId());


            // Generate content
            ContentRequestDTO generatedContentDTO = contentRequestService.createAndGenerateContent(requestDTO);

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
    @PostMapping("/metrics")
    public ResponseEntity<?> generateMetrics(@RequestBody ContentReviewDTO reviewDTO){

        try {
            log.info("Received content review request : {}",reviewDTO);
            // Validate the request
            if(reviewDTO.getReviewContent() == null || reviewDTO.getReviewContent().trim().isEmpty()){
                log.error("Empty content received for content reviews");
                Map<String ,String>error = new HashMap<>();
                error.put("error","prompt cannot be empty");
                return   new ResponseEntity<>(error,HttpStatus.BAD_REQUEST);
            }
            // Generate review content
            String content = reviewDTO.getReviewContent();
            String platform = reviewDTO.getReviewPlatform();
            ContentMetrics metricsDto =  contentAnalysisService.analyzeContent(content ,platform);
            log.info("content successfully anlysed ");
            return new ResponseEntity<>(metricsDto,HttpStatus.CREATED);
        }catch (IllegalArgumentException e){
            log.error("Bad request for content review :{}",e.getMessage(),e);
            Map<String,String>error = new HashMap<>();
            error.put("error","invalid request :"+ e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);

        }catch (RuntimeException e) {
            log.error("Runtime exception during Content analysis: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to analyse content: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);

        } catch (Exception e) {
            log.error("Unexpected error during  content analysis : {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "An unexpected error occurred");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }
    // New A/B testing endpoint
    @PostMapping("/ab-test")
    public ResponseEntity<?> generateABTestContent(@RequestBody ContentRequestDTO requestDTO) {
        try {
            log.info("Received A/B test request: {}", requestDTO);

            // Validate the request
            if (requestDTO.getPrompt() == null || requestDTO.getPrompt().trim().isEmpty()) {
                log.error("Empty prompt received for A/B test");
                Map<String, String> error = new HashMap<>();
                error.put("error", "Prompt cannot be empty");
                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);

            }

            // MODIFIED: Set userId from authenticated context
            requestDTO.setUserId(getCurrentUserId());

            // Generate A/B test content
            ContentRequestDTO generatedContentDTO = contentRequestService.createABTestContent(requestDTO);

            log.info("A/B test content generated successfully with ID: {}", generatedContentDTO.getId());
            return new ResponseEntity<>(generatedContentDTO, HttpStatus.CREATED);

        } catch (IllegalArgumentException e) {
            log.error("Bad request for A/B test: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid request: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);

        } catch (RuntimeException e) {
            log.error("Runtime exception during A/B test generation: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to generate A/B test content: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);

        } catch (Exception e) {
            log.error("Unexpected error during A/B test generation: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "An unexpected error occurred");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContentRequestDTO> getContentById(@PathVariable Long id) {
        try {
            ContentRequestDTO content = contentRequestService.getFullContentRequestDetails(id);
            return ResponseEntity.ok(content);
        } catch (RuntimeException e) {
            log.error("Content not found with ID: {}", id, e);
            return ResponseEntity.notFound().build();
        }
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
    // MODIFIED: Endpoint to get content history summaries
    @GetMapping("/history")
    public ResponseEntity<List<ContentHistoryItemDTO>> getHistory() { // Removed @RequestParam userId
        try {
            Long userId = getCurrentUserId(); // Get the authenticated user's ID
            List<ContentHistoryItemDTO> history = contentRequestService.getHistoryItems(userId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            log.error("Error fetching history: {}", e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // NEW: Endpoint to get full content request details by ID
    @GetMapping("/full/{id}")
    public ResponseEntity<ContentRequestDTO> getFullContentDetails(@PathVariable Long id) {
        try {
            ContentRequestDTO details = contentRequestService.getFullContentRequestDetails(id);
            if (details != null) {
                return ResponseEntity.ok(details);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error fetching full content details for ID {}: {}", id, e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
