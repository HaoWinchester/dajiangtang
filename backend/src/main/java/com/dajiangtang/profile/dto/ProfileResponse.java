package com.dajiangtang.profile.dto;

import java.util.Map;

public record ProfileResponse(
        String username,
        Map<String, String> fields
) {
}
