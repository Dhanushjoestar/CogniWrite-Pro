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

        ContentRequest contentRequest = new ContentRequest();
        contentRequest.setPrompt(requestDTO.getPrompt());
        contentRequest.setTargetPlatform(requestDTO.getTargetPlatform());
        contentRequest.setModel(requestDTO.getModel() != null ? requestDTO.getModel() : "gemini");
        contentRequest.setTemperature(requestDTO.getTemperature() != null ? requestDTO.getTemperature() : 0.7);
        contentRequest.setAudienceProfile(audienceProfile);
        contentRequest.setUser(user); // Set the User entity if found
        // REMOVED: contentRequest.setUserId(requestDTO.getUserId()); // Removed explicit userId setter
        contentRequest.setCreatedAt(LocalDateTime.now());
        contentRequest.setGeneratedContents(new ArrayList<>());

        contentRequest = contentRequestRepository.save(contentRequest);

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
            generatedContent.setVariantA(true);
            generatedContent.setModelUsed(contentRequest.getModel());
            generatedContent.setTemperatureUsed(contentRequest.getTemperature());
            generatedContent.setMetrics(metrics);
            generatedContent.setContentRequest(contentRequest);
            generatedContent.setCreatedAt(LocalDateTime.now()); // Ensure createdAt is set for GeneratedContent

            contentRequest.addGeneratedContent(generatedContent);

            contentRequest = contentRequestRepository.save(contentRequest);

            log.info("Successfully generated content with ID: {}", contentRequest.getId());
        } catch (Exception e) {
            log.error("Error generating content with model {}: {}", contentRequest.getModel(), e.getMessage());
            throw new RuntimeException("Failed to generate content: " + e.getMessage(), e);
        }

        return convertEntityToDto(contentRequest);
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

        ContentRequest contentRequest = new ContentRequest();
        contentRequest.setPrompt(requestDTO.getPrompt());
        contentRequest.setTargetPlatform(requestDTO.getTargetPlatform());
        contentRequest.setModel(requestDTO.getModel() != null ? requestDTO.getModel() : "gemini");
        contentRequest.setTemperature(requestDTO.getTemperature() != null ? requestDTO.getTemperature() : 0.7);
        contentRequest.setAudienceProfile(audienceProfile);
        contentRequest.setUser(user);
        // REMOVED: contentRequest.setUserId(requestDTO.getUserId()); // Removed explicit userId setter
        contentRequest.setCreatedAt(LocalDateTime.now());
        contentRequest.setGeneratedContents(new ArrayList<>());

        ContentRequest savedRequest = contentRequestRepository.save(contentRequest);

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
            variantA.setVariantA(true);
            variantA.setModelUsed(savedRequest.getModel());
            variantA.setTemperatureUsed(savedRequest.getTemperature());
            variantA.setMetrics(metricsA);
            variantA.setContentRequest(savedRequest);
            variantA.setCreatedAt(LocalDateTime.now()); // Ensure createdAt is set for GeneratedContent
            savedRequest.addGeneratedContent(variantA);


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
            variantB.setVariantA(false);
            variantB.setModelUsed(variantBModel);
            variantB.setTemperatureUsed(Math.min(1.0, savedRequest.getTemperature() + 0.2));
            variantB.setMetrics(metricsB);
            variantB.setContentRequest(savedRequest);
            variantB.setCreatedAt(LocalDateTime.now()); // Ensure createdAt is set for GeneratedContent
            savedRequest.addGeneratedContent(variantB);

            ContentRequest updatedRequest = contentRequestRepository.save(savedRequest);

            log.info("Successfully created AB test with models: {} and {}",
                    savedRequest.getModel(), variantBModel);

            return convertEntityToDto(updatedRequest);
        } catch (Exception e) {
            log.error("Error creating AB test content: {}", e.getMessage());
            throw new RuntimeException("Failed to create AB test content: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public ContentRequestDTO getFullContentRequestDetails(Long id) {
        return contentRequestRepository.findById(id)
                .map(this::convertEntityToDto)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<ContentRequestDTO> getAllContentRequests() {
        return contentRequestRepository.findAll().stream()
                .map(this::convertEntityToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ContentHistoryItemDTO> getHistoryItems(Long userId) {
        List<ContentRequest> requests;
        if (userId != null) {
            requests = contentRequestRepository.findByUserIdOrderByCreatedAtDesc(userId);
        } else {
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
        if (!contentRequestRepository.existsById(id)) {
            throw new RuntimeException("Content Request not found with id: " + id);
        }
        contentRequestRepository.deleteById(id);
        log.info("Content Request with ID {} deleted successfully.", id);
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
            dto.setUserId(user.getId());
            UserDTO userDTO = new UserDTO();
            userDTO.setId(user.getId());
            userDTO.setName(user.getName());
            userDTO.setEmail(user.getEmail());
            userDTO.setRole(user.getRole());
            dto.setUser(userDTO);
        }

        if (entity.getGeneratedContents() != null) {
            List<GeneratedContentDTO> contentDTOs = entity.getGeneratedContents().stream()
                    .map(this::convertGeneratedContentToDto)
                    .collect(Collectors.toList());
            dto.setGeneratedContents(contentDTOs);
        } else {
            dto.setGeneratedContents(List.of());
        }

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

        return dto;
    }
}
