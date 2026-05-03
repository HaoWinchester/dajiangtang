package com.dajiangtang.profile.dto;

import java.util.Map;

public record ProfileModuleRecordResponse(
        long id,
        String module,
        Map<String, String> fields
) {
}
