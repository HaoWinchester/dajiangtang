package com.dajiangtang.profile.dto;

import java.util.Map;

public record ProfileModuleRecordRequest(
        Map<String, String> fields
) {
}
