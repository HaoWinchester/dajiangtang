package com.dajiangtang.auth.controller;

import java.time.Duration;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dajiangtang.auth.dto.AuthResponse;
import com.dajiangtang.auth.dto.LoginRequest;
import com.dajiangtang.auth.dto.RegisterRequest;
import com.dajiangtang.auth.service.AuthService;
import com.dajiangtang.security.CurrentUserRoleResolver;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return withRoleCookie(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return withRoleCookie(response);
    }

    private ResponseEntity<AuthResponse> withRoleCookie(AuthResponse response) {
        ResponseCookie cookie = ResponseCookie.from(CurrentUserRoleResolver.ROLE_COOKIE, response.role())
                .path("/")
                .maxAge(Duration.ofHours(8))
                .sameSite("Lax")
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }
}
