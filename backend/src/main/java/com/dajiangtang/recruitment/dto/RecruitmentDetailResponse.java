package com.dajiangtang.recruitment.dto;

import java.time.LocalDate;

import com.dajiangtang.recruitment.domain.Recruitment;

public record RecruitmentDetailResponse(
        String id,
        String position,
        String companyName,
        String department,
        String recruitmentPost,
        String jobTags,
        int headcount,
        String city,
        String workLocation,
        String salary,
        LocalDate requiredArrivalDate,
        String recruitmentProgress,
        String owner,
        String contactPhone,
        String jobDescription,
        String jobRequirement,
        String skillRequirement,
        String welfare,
        String follower,
        String level,
        String remark,
        boolean cspmPreferred,
        String status
) {

    public static RecruitmentDetailResponse from(Recruitment recruitment) {
        return new RecruitmentDetailResponse(
                recruitment.id(),
                recruitment.position(),
                recruitment.companyName(),
                recruitment.department(),
                recruitment.recruitmentPost(),
                recruitment.jobTags(),
                recruitment.headcount(),
                recruitment.city(),
                recruitment.workLocation(),
                recruitment.salary(),
                recruitment.requiredArrivalDate(),
                recruitment.recruitmentProgress(),
                recruitment.owner(),
                recruitment.contactPhone(),
                recruitment.jobDescription(),
                recruitment.jobRequirement(),
                recruitment.skillRequirement(),
                recruitment.welfare(),
                recruitment.follower(),
                recruitment.level(),
                recruitment.remark(),
                recruitment.cspmPreferred(),
                recruitment.status().name()
        );
    }
}
