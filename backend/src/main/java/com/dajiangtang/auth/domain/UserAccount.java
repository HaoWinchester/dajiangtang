package com.dajiangtang.auth.domain;

import java.time.Instant;

import com.dajiangtang.user.domain.UserRole;

public record UserAccount(
        String username,
        String passwordHash,
        String phone,
        UserRole role,
        Instant createdAt
) {
}
