package com.dajiangtang.recruitment.domain;

import java.time.Instant;

public record Recruitment(
        String id,
        String position,
        String salary,
        String companyName,
        String city,
        String owner,
        int headcount,
        boolean cspmPreferred,
        RecruitmentStatus status,
        Instant publishedAt,
        Instant updatedAt,
        String contactPhone
) {

    public Instant latestActivityAt() {
        if (updatedAt == null) {
            return publishedAt;
        }
        if (publishedAt == null) {
            return updatedAt;
        }
        return updatedAt.isAfter(publishedAt) ? updatedAt : publishedAt;
    }
}
