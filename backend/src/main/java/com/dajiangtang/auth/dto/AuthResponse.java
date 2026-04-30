package com.dajiangtang.auth.dto;

public record AuthResponse(
        String username,
        String role,
        String message
) {
}
