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
import com.cogniwritepro.repository.GeneratedContentRepository;
import com.cogniwritepro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
    private final GeneratedContentRepository generatedContentRepository;
    private final LLMService llmService;
    private final ContentAnalysisService analysisService;

    @Transactional
    public ContentRequestDTO createAndGenerateContent(ContentRequestDTO requestDTO) {
        log.info("Creating content request with model: {}", requestDTO.getModel());

        // Step 1: Fetch audience profile
        AudienceProfile audienceProfile = audienceProfileRepository.findById(requestDTO.getAudienceProfileId())
                .orElseThrow(() -> new RuntimeException("Audience Profile not found with id: " + requestDTO.getAudienceProfileId()));

        // Step 2: Fetch user (optional)
        User user = null;
        if (requestDTO.getUserId() != null) {
            user = userRepository.findById(requestDTO.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + requestDTO.getUserId()));
        }

        // Step 3: Save ContentRequest
        ContentRequest contentRequest = new ContentRequest();
        contentRequest.setPrompt(requestDTO.getPrompt());
        contentRequest.setTargetPlatform(requestDTO.getTargetPlatform());
        contentRequest.setAudienceProfile(audienceProfile);
        contentRequest.setUser(user);
        contentRequest.setTemperature(requestDTO.getTemperature() != null ? requestDTO.getTemperature() : 0.7);
        contentRequest.setModel(requestDTO.getModel() != null ? requestDTO.getModel() : "gemini");

        ContentRequest savedRequest = contentRequestRepository.save(contentRequest);

        // Step 4: Generate LLM prompt
        String llmPrompt = buildLlmPrompt(
                savedRequest.getPrompt(),
                savedRequest.getTargetPlatform(),
                audienceProfile
        );

        log.info("Generated LLM prompt: {}", llmPrompt);

        // Step 5: Generate content variant with better error handling
        try {
            GeneratedContent generatedContent = llmService.generateContentVariant(
                    llmPrompt,
                    savedRequest.getModel(),
                    savedRequest.getTemperature(),
                    savedRequest.getTargetPlatform()
            );
            generatedContent.setVariantA(true);
            generatedContent.setCreatedAt(LocalDateTime.now()); // Corrected: setCreatedAt
            generatedContent.setContentRequest(savedRequest);
            generatedContent.setModelUsed(savedRequest.getModel());
            generatedContent.setTemperatureUsed(savedRequest.getTemperature());

            // Generate and set metrics
            ContentMetrics metricsDto = analysisService.analyzeContent(generatedContent.getContent(), savedRequest.getTargetPlatform());
            ContentMetrics metricsEntity = new ContentMetrics();
            metricsEntity.setReadabilityScore(metricsDto.getReadabilityScore());
            metricsEntity.setClarityScore(metricsDto.getClarityScore());
            metricsEntity.setEngagementPrediction(metricsDto.getEngagementPrediction());
            metricsEntity.setPlatformOptimization(metricsDto.getPlatformOptimization());
            metricsEntity.setOptimizationTips(metricsDto.getOptimizationTips());
            // metricsEntity.setGeneratedContent(generatedContent); // REMOVED: ContentMetrics is @Embeddable, cannot have this relationship
            generatedContent.setMetrics(metricsEntity); // This is how the metrics are associated

            savedRequest.addGeneratedContent(generatedContent);
            contentRequestRepository.save(savedRequest);

            log.info("Successfully generated content with model: {}", savedRequest.getModel());
        } catch (Exception e) {
            log.error("Error generating content with model {}: {}", savedRequest.getModel(), e.getMessage());
            throw new RuntimeException("Failed to generate content: " + e.getMessage(), e);
        }

        // Step 6: Return full DTO
        return convertEntityToDto(savedRequest);
    }

    @Transactional
    public ContentRequestDTO createABTestContent(ContentRequestDTO requestDTO) {
        log.info("Creating AB test content with primary model: {}", requestDTO.getModel());

        // Step 1: Fetch audience profile
        AudienceProfile audienceProfile = audienceProfileRepository.findById(requestDTO.getAudienceProfileId())
                .orElseThrow(() -> new RuntimeException("Audience Profile not found with id: " + requestDTO.getAudienceProfileId()));

        // Step 2: Fetch user (optional)
        User user = null;
        if (requestDTO.getUserId() != null) {
            user = userRepository.findById(requestDTO.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + requestDTO.getUserId()));
        }

        // Step 3: Create and save ContentRequest
        ContentRequest contentRequest = new ContentRequest();
        contentRequest.setPrompt(requestDTO.getPrompt());
        contentRequest.setTargetPlatform(requestDTO.getTargetPlatform());
        contentRequest.setAudienceProfile(audienceProfile);
        contentRequest.setUser(user);
        contentRequest.setTemperature(requestDTO.getTemperature() != null ? requestDTO.getTemperature() : 0.7);
        contentRequest.setModel(requestDTO.getModel() != null ? requestDTO.getModel() : "gemini");

        ContentRequest savedRequest = contentRequestRepository.save(contentRequest);

        // Step 4: Generate LLM prompt
        String llmPrompt = buildLlmPrompt(
                savedRequest.getPrompt(),
                savedRequest.getTargetPlatform(),
                audienceProfile
        );

        try {
            // Step 5: Generate Variant A
            GeneratedContent variantA = llmService.generateContentVariant(
                    llmPrompt,
                    savedRequest.getModel(),
                    savedRequest.getTemperature(),
                    savedRequest.getTargetPlatform()
            );
            variantA.setVariantA(true);
            variantA.setCreatedAt(LocalDateTime.now()); // Corrected: setCreatedAt
            variantA.setContentRequest(savedRequest);
            variantA.setModelUsed(savedRequest.getModel());
            variantA.setTemperatureUsed(savedRequest.getTemperature());

            // Generate and set metrics for Variant A
            ContentMetrics metricsADto = analysisService.analyzeContent(variantA.getContent(), savedRequest.getTargetPlatform());
            ContentMetrics metricsAEntity = new ContentMetrics();
            metricsAEntity.setReadabilityScore(metricsADto.getReadabilityScore());
            metricsAEntity.setClarityScore(metricsADto.getClarityScore());
            metricsAEntity.setEngagementPrediction(metricsADto.getEngagementPrediction());
            metricsAEntity.setPlatformOptimization(metricsADto.getPlatformOptimization());
            metricsAEntity.setOptimizationTips(metricsADto.getOptimizationTips());
            // metricsAEntity.setGeneratedContent(variantA); // REMOVED
            variantA.setMetrics(metricsAEntity);


            // Step 6: Generate Variant B with different model
            String variantBModel = "mistral".equals(savedRequest.getModel()) ? "gemini" : "mistral";
            GeneratedContent variantB = llmService.generateContentVariant(
                    llmPrompt,
                    variantBModel,
                    Math.min(1.0, savedRequest.getTemperature() + 0.2),  // Slightly higher temp
                    savedRequest.getTargetPlatform()
            );
            variantB.setVariantA(false);
            variantB.setCreatedAt(LocalDateTime.now()); // Corrected: setCreatedAt
            variantB.setContentRequest(savedRequest);
            variantB.setModelUsed(variantBModel);
            variantB.setTemperatureUsed(Math.min(1.0, savedRequest.getTemperature() + 0.2));

            // Generate and set metrics for Variant B
            ContentMetrics metricsBDto = analysisService.analyzeContent(variantB.getContent(), savedRequest.getTargetPlatform());
            ContentMetrics metricsBEntity = new ContentMetrics();
            metricsBEntity.setReadabilityScore(metricsBDto.getReadabilityScore());
            metricsBEntity.setClarityScore(metricsBDto.getClarityScore());
            metricsBEntity.setEngagementPrediction(metricsBDto.getEngagementPrediction());
            metricsBEntity.setPlatformOptimization(metricsBDto.getPlatformOptimization());
            metricsBEntity.setOptimizationTips(metricsBDto.getOptimizationTips());
            // metricsBEntity.setGeneratedContent(variantB); // REMOVED
            variantB.setMetrics(metricsBEntity);


            // Step 7: Add both variants to request
            savedRequest.addGeneratedContent(variantA);
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

    public ContentRequestDTO getContentRequestById(Long id) {
        ContentRequest contentRequest = contentRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Content Request not found with id: " + id));
        return convertEntityToDto(contentRequest);
    }

    public List<ContentRequestDTO> getAllContentRequests() {
        return contentRequestRepository.findAll().stream()
                .map(this::convertEntityToDto)
                .collect(Collectors.toList());
    }

    public List<ContentRequestDTO> getContentRequestsByUserId(Long userId) {
        return contentRequestRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::convertEntityToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteContentRequest(Long id) {
        ContentRequest request = contentRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Content Request not found with id: " + id));

        request.getGeneratedContents().clear();
        contentRequestRepository.save(request);

        contentRequestRepository.deleteById(id);
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

    // NEW: Method to get history items (summaries)
    @Transactional(readOnly = true)
    public List<ContentHistoryItemDTO> getHistoryItems(Long userId) {
        List<ContentRequest> requests;
        if (userId != null) {
            requests = contentRequestRepository.findByUserIdOrderByCreatedAtDesc(userId);
        } else {
            requests = contentRequestRepository.findAllByOrderByCreatedAtDesc();
        }

        return requests.stream()
                .map(req -> new ContentHistoryItemDTO(req.getId(), req.getPrompt(), req.getCreatedAt()))
                .collect(Collectors.toList());
    }

    // NEW: Method to get full content request details by ID
    @Transactional(readOnly = true)
    public ContentRequestDTO getFullContentRequestDetails(Long id) {
        return contentRequestRepository.findById(id)
                .map(this::convertEntityToDto)
                .orElse(null);
    }
}
