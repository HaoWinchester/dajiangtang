package com.dajiangtang.security;

import java.util.Arrays;
import java.util.Optional;

import org.springframework.stereotype.Component;

import com.dajiangtang.common.error.UnauthorizedException;
import com.dajiangtang.user.domain.UserRole;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

@Component
public class CurrentUserRoleResolver {

    public static final String ROLE_HEADER = "X-User-Role";
    public static final String ROLE_COOKIE = "USER_ROLE";

    public UserRole resolve(HttpServletRequest request) {
        String roleToken = firstPresent(request.getHeader(ROLE_HEADER), roleFromCookie(request).orElse(null));
        return UserRole.fromToken(roleToken)
                .orElseThrow(() -> new UnauthorizedException("未登录或登录态失效。"));
    }

    public boolean canCreateRecruitment(UserRole role) {
        return role.canCreateRecruitment();
    }

    private Optional<String> roleFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return Optional.empty();
        }
        return Arrays.stream(request.getCookies())
                .filter(cookie -> ROLE_COOKIE.equals(cookie.getName()))
                .findFirst()
                .map(Cookie::getValue);
    }

    private String firstPresent(String first, String second) {
        if (first != null && !first.isBlank()) {
            return first;
        }
        return second;
    }
}
