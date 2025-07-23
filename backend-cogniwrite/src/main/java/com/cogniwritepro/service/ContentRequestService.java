// src/main/java/com/cogniwritepro/service/ContentRequestService.java
package com.cogniwritepro.service;

import com.cogniwritepro.dto.AudienceProfileDTO;
import com.cogniwritepro.dto.ContentHistoryItemDTO;
import com.cogniwritepro.dto.ContentMetricsDTO;
import com.cogniwritepro.dto.ContentRequestDTO;
import com.cogniwritepro.dto.GeneratedContentDTO;
import com.cogniwritepro.dto.UserDTO;
import com.cogniwritepro.model.AudienceProfile;
import com.cogniwritepro.model.ContentMetrics;
import com.cogniwritepro.model.ContentRequest;
import com.cogniwritepro.model.GeneratedContent;
import com.cogniwritepro.model.User;
import com.cogniwritepro.repository.AudienceProfileRepository;
import com.cogniwritepro.repository.ContentRequestRepository;
import com.cogniwritepro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContentRequestService {

    private final ContentRequestRepository contentRequestRepository;
    private final AudienceProfileRepository audienceProfileRepository;
    private final UserRepository userRepository;
    private final LLMService llmService;
    private final ContentAnalysisService contentAnalysisService;

    @Transactional
    public ContentRequestDTO createAndGenerateContent(ContentRequestDTO requestDTO) {
        log.info("Creating and generating content for prompt: {}", requestDTO.getPrompt());

        AudienceProfile audienceProfile = audienceProfileRepository.findById(requestDTO.getAudienceProfileId())
                .orElseThrow(() -> new RuntimeException("Audience Profile not found with ID: " + requestDTO.getAudienceProfileId()));

        User user = null;
        if (requestDTO.getUserId() != null) {
            user = userRepository.findById(requestDTO.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + requestDTO.getUserId()));
        }
        log.info("Fetched User for generation: {} (ID: {})", user != null ? user.getEmail() : "N/A", user != null ? user.getId() : "N/A"); // DEBUG LOG
        log.info("Fetched AudienceProfile for generation: {} (ID: {})", audienceProfile.getProfileName(), audienceProfile.getId()); // DEBUG LOG

        ContentRequest contentRequest = new ContentRequest();
        contentRequest.setPrompt(requestDTO.getPrompt());
        contentRequest.setTargetPlatform(requestDTO.getTargetPlatform());
        contentRequest.setModel(requestDTO.getModel() != null ? requestDTO.getModel() : "gemini");
        contentRequest.setTemperature(requestDTO.getTemperature() != null ? requestDTO.getTemperature() : 0.7);
        contentRequest.setAudienceProfile(audienceProfile);
        contentRequest.setUser(user); // Set the User entity if found
        contentRequest.setCreatedAt(LocalDateTime.now());
        contentRequest.setGeneratedContents(new ArrayList<>());

        contentRequest = contentRequestRepository.save(contentRequest);
        log.info("ContentRequest entity saved with ID: {}", contentRequest.getId()); // DEBUG LOG
        // NEW: Re-fetch the entity to ensure all relationships are loaded into the persistence context
        contentRequest = contentRequestRepository.findById(contentRequest.getId())
                .orElseThrow(() -> new RuntimeException("Failed to re-fetch ContentRequest after save for single generation"));
        log.info("ContentRequest re-fetched after save for single generation. User ID: {}", contentRequest.getUser() != null ? contentRequest.getUser().getId() : "NULL"); // DEBUG LOG

        String llmPrompt = buildLlmPrompt(
                contentRequest.getPrompt(),
                contentRequest.getTargetPlatform(),
                audienceProfile
        );

        log.info("Generated LLM prompt: {}", llmPrompt);

        try {
            GeneratedContent generatedContentFromLLM = llmService.generateContentVariant(
                    llmPrompt,
                    contentRequest.getModel(),
                    contentRequest.getTemperature(),
                    contentRequest.getTargetPlatform()
            );

            String generatedText = generatedContentFromLLM.getContent();
            ContentMetrics metrics = generatedContentFromLLM.getMetrics();

            GeneratedContent generatedContent = new GeneratedContent();
            generatedContent.setContent(generatedText);
            generatedContent.setVariantA(true); // For single generation, consider it variant A
            generatedContent.setModelUsed(contentRequest.getModel());
            generatedContent.setTemperatureUsed(contentRequest.getTemperature());
            generatedContent.setMetrics(metrics);
            generatedContent.setContentRequest(contentRequest);
            generatedContent.setCreatedAt(LocalDateTime.now());

            contentRequest.addGeneratedContent(generatedContent);

            contentRequest = contentRequestRepository.save(contentRequest);
            log.info("GeneratedContent added and ContentRequest updated. Final ContentRequest ID: {}", contentRequest.getId()); // DEBUG LOG
            // NEW: Re-fetch again to ensure the generated content is fully loaded before DTO conversion
            contentRequest = contentRequestRepository.findById(contentRequest.getId())
                    .orElseThrow(() -> new RuntimeException("Failed to re-fetch ContentRequest after adding generated content"));
            log.info("ContentRequest re-fetched after adding generated content. Generated contents count: {}", contentRequest.getGeneratedContents().size()); // DEBUG LOG


            return convertEntityToDto(contentRequest);
        } catch (Exception e) {
            log.error("Error generating content with model {}: {}", contentRequest.getModel(), e.getMessage());
            throw new RuntimeException("Failed to generate content: " + e.getMessage(), e);
        }
    }

    @Transactional
    public ContentRequestDTO createABTestContent(ContentRequestDTO requestDTO) {
        log.info("Creating A/B test content with primary model: {}", requestDTO.getModel());

        AudienceProfile audienceProfile = audienceProfileRepository.findById(requestDTO.getAudienceProfileId())
                .orElseThrow(() -> new RuntimeException("Audience Profile not found with ID: " + requestDTO.getAudienceProfileId()));

        User user = null;
        if (requestDTO.getUserId() != null) {
            user = userRepository.findById(requestDTO.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + requestDTO.getUserId()));
        }
        log.info("Fetched User for AB Test: {} (ID: {})", user != null ? user.getEmail() : "N/A", user != null ? user.getId() : "N/A"); // DEBUG LOG
        log.info("Fetched AudienceProfile for AB Test: {} (ID: {})", audienceProfile.getProfileName(), audienceProfile.getId()); // DEBUG LOG

        ContentRequest contentRequest = new ContentRequest();
        contentRequest.setPrompt(requestDTO.getPrompt());
        contentRequest.setTargetPlatform(requestDTO.getTargetPlatform());
        contentRequest.setModel(requestDTO.getModel() != null ? requestDTO.getModel() : "gemini");
        contentRequest.setTemperature(requestDTO.getTemperature() != null ? requestDTO.getTemperature() : 0.7);
        contentRequest.setAudienceProfile(audienceProfile);
        contentRequest.setUser(user);
        contentRequest.setCreatedAt(LocalDateTime.now());
        contentRequest.setGeneratedContents(new ArrayList<>());

        ContentRequest savedRequest = contentRequestRepository.save(contentRequest);
        log.info("AB Test ContentRequest entity saved with ID: {}", savedRequest.getId()); // DEBUG LOG
        // NEW: Re-fetch the entity to ensure all relationships are loaded into the persistence context
        savedRequest = contentRequestRepository.findById(savedRequest.getId())
                .orElseThrow(() -> new RuntimeException("Failed to re-fetch ContentRequest after save for AB test"));
        log.info("ContentRequest re-fetched after initial save for AB test. User ID: {}", savedRequest.getUser() != null ? savedRequest.getUser().getId() : "NULL"); // DEBUG LOG


        String llmPrompt = buildLlmPrompt(
                savedRequest.getPrompt(),
                savedRequest.getTargetPlatform(),
                audienceProfile
        );

        try {
            // Generate Variant A
            GeneratedContent generatedContentAFromLLM = llmService.generateContentVariant(
                    llmPrompt,
                    savedRequest.getModel(),
                    savedRequest.getTemperature(),
                    savedRequest.getTargetPlatform()
            );
            String generatedTextA = generatedContentAFromLLM.getContent();
            ContentMetrics metricsA = generatedContentAFromLLM.getMetrics();

            GeneratedContent variantA = new GeneratedContent();
            variantA.setContent(generatedTextA);
            variantA.setVariantA(true); // Explicitly set variantA to true
            variantA.setModelUsed(savedRequest.getModel());
            variantA.setTemperatureUsed(savedRequest.getTemperature());
            variantA.setMetrics(metricsA);
            variantA.setContentRequest(savedRequest);
            variantA.setCreatedAt(LocalDateTime.now());
            savedRequest.addGeneratedContent(variantA);
            log.info("Variant A generated and added to ContentRequest. Content length: {}", generatedTextA.length()); // DEBUG LOG

            // Generate Variant B with different model (using gemini-1.5-flash for reliability)
            String variantBModel = "gemini-1.5-flash"; // Hardcoded for reliability as Mistral was failing
            GeneratedContent generatedContentBFromLLM = llmService.generateContentVariant(
                    llmPrompt + " (alternative version)",
                    variantBModel,
                    Math.min(1.0, savedRequest.getTemperature() + 0.2),
                    savedRequest.getTargetPlatform()
            );
            String generatedTextB = generatedContentBFromLLM.getContent();
            ContentMetrics metricsB = generatedContentBFromLLM.getMetrics();

            GeneratedContent variantB = new GeneratedContent();
            variantB.setContent(generatedTextB);
            variantB.setVariantA(false); // Explicitly set variantA to false
            variantB.setModelUsed(variantBModel);
            variantB.setTemperatureUsed(Math.min(1.0, savedRequest.getTemperature() + 0.2));
            variantB.setMetrics(metricsB);
            variantB.setContentRequest(savedRequest);
            variantB.setCreatedAt(LocalDateTime.now());
            savedRequest.addGeneratedContent(variantB);
            log.info("Variant B generated and added to ContentRequest. Content length: {}", generatedTextB.length()); // DEBUG LOG

            ContentRequest updatedRequest = contentRequestRepository.save(savedRequest);
            log.info("AB Test ContentRequest updated with both variants. Final ContentRequest ID: {}", updatedRequest.getId()); // DEBUG LOG
            // NEW: Re-fetch again to ensure both generated contents are fully loaded before DTO conversion
            updatedRequest = contentRequestRepository.findById(updatedRequest.getId())
                    .orElseThrow(() -> new RuntimeException("Failed to re-fetch ContentRequest after adding both generated contents"));
            log.info("ContentRequest re-fetched after adding both generated contents. Generated contents count: {}", updatedRequest.getGeneratedContents().size()); // DEBUG LOG

            log.info("ContentRequest entity before DTO conversion (AB Test): {}", updatedRequest.toString()); // DEBUG LOG

            return convertEntityToDto(updatedRequest);
        } catch (Exception e) {
            log.error("Error creating AB test content: {}", e.getMessage());
            throw new RuntimeException("Failed to create AB test content: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public ContentRequestDTO getFullContentRequestDetails(Long id) {
        log.info("Fetching full content request details for ID: {}", id); // DEBUG LOG
        return contentRequestRepository.findById(id)
                .map(this::convertEntityToDto)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<ContentRequestDTO> getAllContentRequests() {
        log.info("Fetching all content requests."); // DEBUG LOG
        return contentRequestRepository.findAll().stream()
                .map(this::convertEntityToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ContentHistoryItemDTO> getHistoryItems(Long userId) {
        log.info("Fetching history items for userId: {}", userId); // DEBUG LOG
        List<ContentRequest> requests;
        if (userId != null) {
            requests = contentRequestRepository.findByUserIdOrderByCreatedAtDesc(userId);
            log.info("Found {} history items for userId: {}", requests.size(), userId); // DEBUG LOG
        } else {
            log.warn("No userId provided for history items. Returning empty list."); // DEBUG LOG
            return Collections.emptyList();
        }

        return requests.stream()
                .map(req -> {
                    String type = "generate";
                    if (req.getGeneratedContents() != null && req.getGeneratedContents().size() > 1) {
                        type = "ab-test";
                    }
                    return new ContentHistoryItemDTO(req.getId(), req.getPrompt(), req.getCreatedAt(), type);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteContentRequest(Long id) {
        log.info("Attempting to delete content request with ID: {}", id); // DEBUG LOG
        if (!contentRequestRepository.existsById(id)) {
            log.warn("Content Request with ID {} not found for deletion.", id); // DEBUG LOG
            throw new RuntimeException("Content Request not found with id: " + id);
        }
        contentRequestRepository.deleteById(id);
        log.info("Content Request with ID {} deleted successfully.", id); // DEBUG LOG
    }

    private String buildLlmPrompt(String userPrompt, String targetPlatform, AudienceProfile audienceProfile) {
        return String.format("""
                Create engaging %s content for the following request:

                Request: %s
                
                Target Audience:
                - Age: %s
                - Type: %s
                - Preferred tone: %s
                
                Platform: %s
                
                Requirements:
                - Write in %s tone
                - Optimize for %s platform constraints
                - Target %s audience (%s age group)
                - Make it engaging and shareable
                - Keep it concise and impactful
                
                Generate only the final content without any meta-commentary or explanations.
                """,
                targetPlatform.toLowerCase(),
                userPrompt,
                audienceProfile.getAgeGroup(),
                audienceProfile.getPersonaType(),
                audienceProfile.getTone(),
                targetPlatform,
                audienceProfile.getTone().toLowerCase(),
                targetPlatform,
                audienceProfile.getPersonaType(),
                audienceProfile.getAgeGroup()
        );
    }

    private ContentRequestDTO convertEntityToDto(ContentRequest entity) {
        ContentRequestDTO dto = new ContentRequestDTO();
        dto.setId(entity.getId());
        dto.setPrompt(entity.getPrompt());
        dto.setTargetPlatform(entity.getTargetPlatform());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setTemperature(entity.getTemperature());
        dto.setModel(entity.getModel());

        if (entity.getAudienceProfile() != null) {
            AudienceProfile profile = entity.getAudienceProfile();
            dto.setAudienceProfileId(profile.getId());

            AudienceProfileDTO profileDTO = new AudienceProfileDTO();
            profileDTO.setId(profile.getId());
            profileDTO.setProfileName(profile.getProfileName());
            profileDTO.setAgeGroup(profile.getAgeGroup());
            profileDTO.setPersonaType(profile.getPersonaType());
            profileDTO.setTone(profile.getTone());
            dto.setAudienceProfile(profileDTO);
            dto.setAudience(profile.getProfileName());
        }

        if (entity.getUser() != null) {
            User user = entity.getUser();
            dto.setUserId(user.getId()); // Set userId in DTO from User entity
            UserDTO userDTO = new UserDTO();
            userDTO.setId(user.getId());
            userDTO.setName(user.getName());
            userDTO.setEmail(user.getEmail());
            userDTO.setRole(user.getRole());
            dto.setUser(userDTO);
        } else {
            dto.setUserId(null); // Explicitly set to null if user is not found/associated
        }

        if (entity.getGeneratedContents() != null) {
            List<GeneratedContentDTO> contentDTOs = entity.getGeneratedContents().stream()
                    .map(this::convertGeneratedContentToDto)
                    .collect(Collectors.toList());
            dto.setGeneratedContents(contentDTOs);
        } else {
            dto.setGeneratedContents(List.of());
        }
        log.info("Converted DTO for ContentRequest ID {}: userId={}, generatedContents.size={}",
                entity.getId(), dto.getUserId(), dto.getGeneratedContents().size()); // DEBUG LOG
        return dto;
    }

    private GeneratedContentDTO convertGeneratedContentToDto(GeneratedContent entity) {
        GeneratedContentDTO dto = new GeneratedContentDTO();
        dto.setId(entity.getId());
        dto.setContent(entity.getContent());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setRequestId(entity.getContentRequest() != null ?
                entity.getContentRequest().getId() : null);
        dto.setVariantA(entity.isVariantA());
        dto.setModelUsed(entity.getModelUsed());
        dto.setTemperatureUsed(entity.getTemperatureUsed());

        if (entity.getMetrics() != null) {
            ContentMetrics metrics = entity.getMetrics();
            ContentMetricsDTO metricsDTO = new ContentMetricsDTO();
            metricsDTO.setReadabilityScore(metrics.getReadabilityScore());
            metricsDTO.setClarityScore(metrics.getClarityScore());
            metricsDTO.setEngagementPrediction(metrics.getEngagementPrediction());
            metricsDTO.setPlatformOptimization(metrics.getPlatformOptimization());
            metricsDTO.setOptimizationTips(metrics.getOptimizationTips());
            dto.setMetrics(metricsDTO);
        }
        log.info("Converted GeneratedContentDTO ID {}: variantA={}, contentSnippet='{}'", dto.getId(), dto.isVariantA(), dto.getContent() != null ? dto.getContent().substring(0, Math.min(50, dto.getContent().length())) + "..." : "N/A"); // DEBUG LOG
        return dto;
    }
}
