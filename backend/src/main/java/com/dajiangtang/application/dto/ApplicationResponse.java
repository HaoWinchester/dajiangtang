package com.dajiangtang.application.dto;

public record ApplicationResponse(
        long id,
        String recruitmentId,
        String applicantName,
        String phone,
        String status,
        String message
) {
}
