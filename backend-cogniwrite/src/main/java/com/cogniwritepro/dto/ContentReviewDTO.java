package com.cogniwritepro.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class ContentReviewDTO {

    private  String reviewContent;
    private String reviewPlatform;
}
