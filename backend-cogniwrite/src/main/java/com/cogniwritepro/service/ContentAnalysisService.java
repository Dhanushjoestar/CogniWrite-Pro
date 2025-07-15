package com.cogniwritepro.service;

import com.cogniwritepro.model.ContentMetrics;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.regex.Pattern;

@Service
public class ContentAnalysisService {

    // Constants for scoring
    private static final int IDEAL_SENTENCE_LENGTH = 20;
    private static final int IDEAL_WORD_LENGTH = 5;
    private static final double PASSIVE_PENALTY = 0.2;

    public ContentMetrics analyzeContent(String content, String platform) {
        // 1. Basic readability metrics
        double readability = calculateReadability(content);

        // 2. Clarity score
        double clarity = calculateClarity(content);

        // 3. Platform-specific optimization
        int platformOptimization = calculatePlatformScore(content, platform);

        // 4. Engagement prediction
        int engagement = (int) ((readability * 40) + (clarity * 40) + (platformOptimization * 20));

        // 5. Optimization tips
        String tips = generateOptimizationTips(content);

        return new ContentMetrics(
                Math.round(readability * 100.0) / 100.0,
                Math.round(clarity * 100.0) / 100.0,
                engagement,
                platformOptimization,
                tips
        );
    }

    private double calculateReadability(String content) {
        // Calculate Flesch Reading Ease Score approximation
        int sentences = content.split("[.!?]+").length;
        int words = content.split("\\s+").length;
        int syllables = countSyllables(content);

        if (sentences == 0 || words == 0) return 6.0;

        double score = 206.835 - (1.015 * (words / (double) sentences))
                - (84.6 * (syllables / (double) words));

        // Normalize to 0-10 scale
        return Math.max(0, Math.min(10, score / 10));
    }

    private int countSyllables(String text) {
        // Simple syllable estimation
        String word = text.toLowerCase();
        int count = Math.max(1, word.split("[aeiouy]+").length - 1);
        if (word.endsWith("e")) count--;
        return count;
    }

    private double calculateClarity(String content) {
        // Analyze sentence structure
        String[] sentences = content.split("[.!?]+");
        if (sentences.length == 0) return 7.0;

        int complexSentences = 0;
        int passiveSentences = 0;

        for (String sentence : sentences) {
            String trimmed = sentence.trim();
            if (trimmed.isEmpty()) continue;

            // Detect complex sentences
            if (trimmed.split(",").length > 2) complexSentences++;

            // Detect passive voice
            if (Pattern.compile("\\b(am|are|is|was|were|be|being|been)\\b.+\\bby\\b",
                    Pattern.CASE_INSENSITIVE).matcher(trimmed).find()) {
                passiveSentences++;
            }
        }

        // Calculate clarity score (0-10)
        double complexityPenalty = complexSentences * 0.3;
        double passivePenalty = passiveSentences * PASSIVE_PENALTY;
        return Math.max(0, 10 - complexityPenalty - passivePenalty);
    }

    private int calculatePlatformScore(String content, String platform) {
        platform = platform.toLowerCase();
        int score = 70; // Base score

        // Twitter-specific checks
        if (platform.contains("twitter")) {
            int length = content.length();
            if (length <= 280) score += 20; // Within character limit
            if (countHashtags(content) >= 2) score += 10;
        }
        // LinkedIn-specific checks
        else if (platform.contains("linkedin")) {
            if (content.contains("?")) score += 10; // Engagement question
            if (countBulletPoints(content) > 0) score += 10;
            if (content.length() > 100 && content.length() < 500) score += 10;
        }
        // Email-specific checks
        else if (platform.contains("email")) {
            if (content.split("\n\n").length > 3) score += 10; // Good paragraph breaks
            if (content.toLowerCase().contains("regards")) score += 10; // Closing
        }

        return Math.min(100, score);
    }

    private int countHashtags(String content) {
        return content.split("#\\w+", -1).length - 1;
    }

    private int countBulletPoints(String content) {
        return content.split("•|\\* |- ", -1).length - 1;
    }

    private String generateOptimizationTips(String content) {
        StringBuilder tips = new StringBuilder();

        // Sentence length analysis
        String[] sentences = content.split("[.!?]+");
        int longSentences = 0;

        for (String sentence : sentences) {
            int wordCount = sentence.trim().split("\\s+").length;
            if (wordCount > IDEAL_SENTENCE_LENGTH) {
                longSentences++;
            }
        }

        if (longSentences > 0) {
            tips.append("- Break up ").append(longSentences).append(" long sentences\n");
        }

        // Complex word analysis
        String[] words = content.split("\\s+");
        int complexWords = 0;

        for (String word : words) {
            if (word.length() > IDEAL_WORD_LENGTH && countSyllables(word) > 3) {
                complexWords++;
            }
        }

        if (complexWords > 3) {
            tips.append("- Simplify ").append(complexWords).append(" complex words\n");
        }

        // Passive voice detection
        if (content.matches("(?i).*\\b(am|are|is|was|were|be|being|been)\\b.+\\bby\\b.*")) {
            tips.append("- Reduce passive voice constructions\n");
        }

        // Default tip if no issues found
        if (tips.length() == 0) {
            tips.append("Great job! This content is well-optimized");
        }

        return tips.toString();
    }
}