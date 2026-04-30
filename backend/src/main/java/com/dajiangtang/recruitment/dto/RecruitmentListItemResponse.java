package com.dajiangtang.recruitment.dto;

import com.dajiangtang.recruitment.domain.Recruitment;

public record RecruitmentListItemResponse(
        String id,
        String position,
        String salary,
        String companyName,
        String city,
        String owner,
        int headcount
) {

    public static RecruitmentListItemResponse from(Recruitment recruitment) {
        return new RecruitmentListItemResponse(
                recruitment.id(),
                recruitment.position(),
                recruitment.salary(),
                recruitment.companyName(),
                recruitment.city(),
                recruitment.owner(),
                recruitment.headcount()
        );
    }
}
