package com.dajiangtang.analytics.dto;

public record AnalyticsResponse(
        long recruitmentCount,
        long activeTalentCount,
        long applicationCount,
        double averageMatchRate,
        String topCity
) {
}
