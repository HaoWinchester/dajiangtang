package com.dajiangtang.talent.dto;

import java.util.List;

public record TalentDetailResponse(
        long id,
        String maskedName,
        String name,
        String gender,
        String currentCompany,
        String positionTitle,
        String currentCity,
        String industry,
        String jobIntention,
        String expectedCity,
        String personalAdvantage,
        String profile,
        String contactOwner,
        List<String> certificates,
        List<String> contacts
) {
}
