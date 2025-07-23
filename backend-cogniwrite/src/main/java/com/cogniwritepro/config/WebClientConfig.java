// src/main/java/com/cogniwritepro/config/WebClientConfig.java
package com.cogniwritepro.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.servlet.config.annotation.CorsRegistry; // NEW: Import for CORS
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer; // NEW: Import for CORS

@Configuration
public class WebClientConfig implements WebMvcConfigurer { // NEW: Implement WebMvcConfigurer for CORS

    @Bean
    public WebClient webClient() {
        return WebClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com/v1beta")
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    // NEW: CORS configuration moved here from CogniWriteProApplication.java
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // Apply CORS to all /api endpoints
                .allowedOrigins("http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://localhost:5174") // Ensure all frontend origins are listed
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Allowed HTTP methods
                .allowedHeaders("*") // Allow all headers
                .allowCredentials(true) // Allow credentials (e.g., cookies, authorization headers)
                .maxAge(3600); // Max age of CORS pre-flight request cache
    }
}
