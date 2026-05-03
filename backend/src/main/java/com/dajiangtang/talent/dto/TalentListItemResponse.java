package com.dajiangtang.talent.dto;

import java.util.List;

public record TalentListItemResponse(
        long id,
        String maskedName,
        String gender,
        String jobIntention,
        String expectedCity,
        String currentCompany,
        String industry,
        List<String> certificates
) {
}
