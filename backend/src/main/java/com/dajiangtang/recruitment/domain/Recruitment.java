package com.dajiangtang.recruitment.domain;

import java.time.Instant;
import java.time.LocalDate;

public record Recruitment(
        String id,
        String position,
        String salary,
        String companyName,
        String department,
        String recruitmentPost,
        String jobTags,
        String city,
        String workLocation,
        String owner,
        int headcount,
        boolean cspmPreferred,
        RecruitmentStatus status,
        Instant publishedAt,
        Instant updatedAt,
        String contactPhone,
        LocalDate requiredArrivalDate,
        String recruitmentProgress,
        String jobDescription,
        String jobRequirement,
        String skillRequirement,
        String welfare,
        String follower,
        String level,
        String remark
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
