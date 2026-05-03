package com.dajiangtang.home.dto;

import com.dajiangtang.recruitment.domain.Recruitment;

public record HomeRecruitmentItemResponse(
        String id,
        String position,
        String salary,
        String companyName,
        String city,
        String owner,
        int headcount,
        boolean cspmPreferred
) {

    public static HomeRecruitmentItemResponse from(Recruitment recruitment) {
        return new HomeRecruitmentItemResponse(
                recruitment.id(),
                recruitment.position(),
                recruitment.salary(),
                recruitment.companyName(),
                recruitment.city(),
                recruitment.owner(),
                recruitment.headcount(),
                recruitment.cspmPreferred()
        );
    }
}
