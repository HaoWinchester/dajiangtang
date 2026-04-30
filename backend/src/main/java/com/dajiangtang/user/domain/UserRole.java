package com.dajiangtang.user.domain;

import java.util.Locale;
import java.util.Optional;

public enum UserRole {
    ADMIN,
    USER,
    COMPANY;

    public boolean canCreateRecruitment() {
        return this == ADMIN;
    }

    public static Optional<UserRole> fromToken(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }

        String normalized = token.trim().toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "ADMIN", "管理员" -> Optional.of(ADMIN);
            case "USER", "NORMAL", "普通用户" -> Optional.of(USER);
            case "COMPANY", "ENTERPRISE", "企业用户" -> Optional.of(COMPANY);
            default -> Optional.empty();
        };
    }
}
