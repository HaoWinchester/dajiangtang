package com.dajiangtang.recruitment.dto;

public record RecruitmentCreateResponse(
        String id,
        String message,
        RecruitmentDetailResponse recruitment
) {
}
