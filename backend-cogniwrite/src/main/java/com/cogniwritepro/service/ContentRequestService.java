package com.cogniwritepro.service;

import com.cogniwritepro.dto.*;
import com.cogniwritepro.model.*;
import com.cogniwritepro.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContentRequestService {

    private final ContentRequestRepository contentRequestRepository;
    private final AudienceProfileRepository audienceProfileRepository;
    private final UserRepository userRepository;
    private final GeneratedContentRepository generatedContentRepository;
    private final LLMService llmService;

    @Transactional
    public Mono<ContentRequestDTO> createAndGenerateContent(ContentRequestDTO requestDTO) {
        // Step 1: Fetch audience profile
        AudienceProfile audienceProfile = audienceProfileRepository.findById(requestDTO.getAudienceProfileId())
                .orElseThrow(() -> new RuntimeException("Audience Profile not found with id: " + requestDTO.getAudienceProfileId()));

        // Step 2: Fetch user (optional)
        User user = null;
        if (requestDTO.getUserId() != null) {
            user = userRepository.findById(requestDTO.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + requestDTO.getUserId()));
        }

        // Step 3: Save ContentRequest (prompt + audience + platform)
        ContentRequest contentRequest = new ContentRequest();
        contentRequest.setPrompt(requestDTO.getPrompt());
        contentRequest.setTargetPlatform(requestDTO.getTargetPlatform());
        contentRequest.setAudienceProfile(audienceProfile);
        contentRequest.setUser(user);

        ContentRequest savedRequest = contentRequestRepository.save(contentRequest);

        // Step 4: Generate LLM prompt
        String llmPrompt = buildLlmPrompt(
                savedRequest.getPrompt(),
                savedRequest.getTargetPlatform(),
                audienceProfile
        );

        // Step 5: Generate content from Gemini API reactively
        return llmService.generateOptimizedContent(llmPrompt)
                .map(generatedText -> {
                    // Step 6: Save generated content
                    GeneratedContent generatedContent = new GeneratedContent();
                    generatedContent.setContent(generatedText);
                    generatedContent.setContentRequest(savedRequest);
                    GeneratedContent savedGeneratedContent = generatedContentRepository.save(generatedContent);

                    // Step 7: Return full DTO
                    return convertEntityToDto(savedRequest, savedGeneratedContent);
                });
    }

    public ContentRequestDTO getContentRequestById(Long id) {
        ContentRequest contentRequest = contentRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Content Request not found with id: " + id));

        GeneratedContent generatedContent = generatedContentRepository.findByContentRequestId(id).orElse(null);
        return convertEntityToDto(contentRequest, generatedContent);
    }

    public List<ContentRequestDTO> getAllContentRequests() {
        return contentRequestRepository.findAll().stream()
                .map(request -> {
                    GeneratedContent generatedContent = generatedContentRepository
                            .findByContentRequestId(request.getId()).orElse(null);
                    return convertEntityToDto(request, generatedContent);
                }).collect(Collectors.toList());
    }

    public List<ContentRequestDTO> getContentRequestsByUserId(Long userId) {
        return contentRequestRepository.findByUserId(userId).stream()
                .map(request -> {
                    GeneratedContent generatedContent = generatedContentRepository
                            .findByContentRequestId(request.getId()).orElse(null);
                    return convertEntityToDto(request, generatedContent);
                }).collect(Collectors.toList());
    }

    @Transactional
    public void deleteContentRequest(Long id) {
        generatedContentRepository.findByContentRequestId(id).ifPresent(generatedContentRepository::delete);
        if (!contentRequestRepository.existsById(id)) {
            throw new RuntimeException("Content Request not found with id: " + id);
        }
        contentRequestRepository.deleteById(id);
    }

    private String buildLlmPrompt(String userPrompt, String targetPlatform, AudienceProfile audienceProfile) {
        return String.format("""
                Generate content based on the following instructions:

                Original Content Idea: %s
                Target Platform: %s
                Audience Profile:
                  - Age Group: %s
                  - Persona Type: %s
                  - Tone: %s

                Please provide content that is highly optimized for this specific audience and platform, adopting the requested tone. Ensure it resonates effectively with the target persona and age group.
                Output ONLY the generated content, without any introductory or concluding remarks.
                """,
                userPrompt,
                targetPlatform,
                audienceProfile.getAgeGroup(),
                audienceProfile.getPersonaType(),
                audienceProfile.getTone()
        );
    }

    private ContentRequestDTO convertEntityToDto(ContentRequest entity, GeneratedContent generatedContent) {
        ContentRequestDTO dto = new ContentRequestDTO();
        dto.setId(entity.getId());
        dto.setPrompt(entity.getPrompt());
        dto.setTargetPlatform(entity.getTargetPlatform());
        dto.setCreatedAt(entity.getCreatedAt());

        if (entity.getAudienceProfile() != null) {
            AudienceProfile profile = entity.getAudienceProfile();
            AudienceProfileDTO profileDTO = new AudienceProfileDTO();
            profileDTO.setId(profile.getId());
            profileDTO.setProfileName(profile.getProfileName());
            profileDTO.setAgeGroup(profile.getAgeGroup());
            profileDTO.setPersonaType(profile.getPersonaType());
            profileDTO.setTone(profile.getTone());
            dto.setAudienceProfile(profileDTO);
            dto.setAudienceProfileId(profile.getId());
        }

        if (entity.getUser() != null) {
            User user = entity.getUser();
            UserDTO userDTO = new UserDTO();
            userDTO.setId(user.getId());
            userDTO.setName(user.getName());
            userDTO.setEmail(user.getEmail());
            userDTO.setRole(user.getRole());
            dto.setUser(userDTO);
            dto.setUserId(user.getId());
        }

        if (generatedContent != null) {
            GeneratedContentDTO genDTO = new GeneratedContentDTO();
            genDTO.setId(generatedContent.getId());
            genDTO.setContent(generatedContent.getContent());
            genDTO.setCreatedAt(generatedContent.getCreatedAt());
            genDTO.setRequestId(generatedContent.getContentRequest() != null ? generatedContent.getContentRequest().getId() : null);
            dto.setGeneratedContent(genDTO);
        }

        return dto;
    }
}
