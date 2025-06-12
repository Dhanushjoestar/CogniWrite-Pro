// File: src/main/java/com/cogniwritepro/dto/GeneratedContentDTO.java
package com.cogniwritepro.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GeneratedContentDTO {
    private Long id;
    private String content;
    private Long requestId; // ID of the associated ContentRequest
    private LocalDateTime createdAt;
}