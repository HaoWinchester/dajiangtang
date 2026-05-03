package com.dajiangtang.profile.dto;

import java.util.Map;

public record ProfileSaveRequest(
        Map<String, String> fields
) {
}
