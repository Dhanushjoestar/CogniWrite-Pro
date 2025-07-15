package com.cogniwritepro.service;

import com.cogniwritepro.model.ContentMetrics;
import com.cogniwritepro.model.GeneratedContent;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class LLMService {

    private final WebClient webClient;
    private final ContentAnalysisService contentAnalysisService;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${mistral.api.key}")
    private String mistralApiKey;

    @Value("${mistral.api.url}")
    private String mistralApiUrl;

    @Value("${mistral.model}")
    private String mistralModel;

    public GeneratedContent generateContentVariant(
            String prompt,
            String model,
            double temperature,
            String platform
    ) {
        try {
            String content;
            ContentMetrics metrics;

            if ("gemini".equalsIgnoreCase(model)) {
                content = generateWithGemini(prompt, temperature);
                metrics = contentAnalysisService.analyzeContent(content, platform);
            } else if ("mistral".equalsIgnoreCase(model)) {
                content = generateWithMistral(prompt, temperature);
                metrics = contentAnalysisService.analyzeContent(content, platform);
            } else {
                throw new IllegalArgumentException("Unsupported model: " + model);
            }

            return createContentEntity(content, metrics, model, temperature);
        } catch (Exception e) {
            log.error("Content generation failed: {}", e.getMessage());
            // Try Gemini as fallback
            try {
                String content = generateWithGemini(prompt, temperature);
                ContentMetrics metrics = contentAnalysisService.analyzeContent(content, platform);
                return createContentEntity(content, metrics, model, temperature);
            } catch (Exception ex) {
                return createFallbackVariant(prompt, platform, model, temperature);
            }
        }
    }

    private String generateWithGemini(String prompt, double temperature) {
        String endpoint = "/models/gemini-2.0-flash:generateContent";

        Map<String, Object> requestBody = Map.of(
                "contents", Collections.singletonList(
                        Map.of("parts", Collections.singletonList(
                                        Map.of("text", prompt)
                                )
                        )),
                "generationConfig", Map.of(
                        "temperature", temperature,
                        "maxOutputTokens", 2048
                )
        );

        try {
            JsonNode geminiResponse = webClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path(endpoint)
                            .queryParam("key", geminiApiKey)
                            .build())
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .timeout(Duration.ofSeconds(15))
                    .block();

            return extractGeminiGeneratedText(geminiResponse);
        } catch (WebClientResponseException e) {
            throw new RuntimeException("Gemini API error: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            throw new RuntimeException("Gemini request failed: " + e.getMessage(), e);
        }
    }

    private String generateWithMistral(String prompt, double temperature) {
        Map<String, Object> message = Map.of(
                "role", "user",
                "content", prompt
        );

        Map<String, Object> requestBody = Map.of(
                "model", mistralModel,
                "messages", List.of(message),
                "temperature", temperature,
                "max_tokens", 2048
        );

        try {
            JsonNode mistralResponse = webClient.post()
                    .uri(mistralApiUrl)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + mistralApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .onStatus(status -> status.isError(), clientResponse ->
                            clientResponse.bodyToMono(String.class)
                                    .map(body -> new RuntimeException("Mistral error: " + clientResponse.statusCode() + " - " + body))
                    )
                    .bodyToMono(JsonNode.class)
                    .timeout(Duration.ofSeconds(15))
                    .block();

            return extractMistralGeneratedText(mistralResponse);
        } catch (WebClientResponseException e) {
            log.error("Mistral API error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Mistral API error", e);
        } catch (Exception e) {
            log.error("Mistral request failed", e);
            throw new RuntimeException("Mistral request failed", e);
        }
    }

    private String generateFallbackContent(String prompt, double temperature) {
        String[] starters = {
                "Here's an approach: ",
                "Consider this perspective: ",
                "One way to think about this: ",
                "An alternative viewpoint: "
        };

        int index = (int) (temperature * starters.length) % starters.length;
        String starter = starters[index];

        return starter + truncatePrompt(prompt, 200);
    }

    private String truncatePrompt(String prompt, int maxLength) {
        if (prompt.length() <= maxLength) return prompt;
        return prompt.substring(0, maxLength) + "...";
    }

    private String extractGeminiGeneratedText(JsonNode response) {
        return response.path("candidates")
                .get(0)
                .path("content")
                .path("parts")
                .get(0)
                .path("text")
                .asText();
    }

    private String extractMistralGeneratedText(JsonNode response) {
        if (response != null &&
                response.has("choices") &&
                response.get("choices").size() > 0) {

            return response.path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText();
        }
        throw new RuntimeException("Invalid Mistral response format");
    }

    private GeneratedContent createContentEntity(
            String content,
            ContentMetrics metrics,
            String model,
            double temperature
    ) {
        GeneratedContent entity = new GeneratedContent();
        entity.setContent(content);
        entity.setMetrics(metrics);
        entity.setModelUsed(model);
        entity.setTemperatureUsed(temperature);
        return entity;
    }

    private GeneratedContent createFallbackVariant(
            String prompt,
            String platform,
            String model,
            double temperature
    ) {
        String content = generateFallbackContent(prompt, temperature);
        ContentMetrics metrics = contentAnalysisService.analyzeContent(content, platform);
        return createContentEntity(content, metrics, model, temperature);
    }
}