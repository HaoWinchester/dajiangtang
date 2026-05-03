package com.dajiangtang.company.dto;

import java.util.Map;

public record CompanyProfileResponse(
        String username,
        Map<String, Object> fields
) {
}
