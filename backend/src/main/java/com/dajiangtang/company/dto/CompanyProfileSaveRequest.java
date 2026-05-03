package com.dajiangtang.company.dto;

import java.util.Map;

public record CompanyProfileSaveRequest(
        Map<String, Object> fields
) {
}
