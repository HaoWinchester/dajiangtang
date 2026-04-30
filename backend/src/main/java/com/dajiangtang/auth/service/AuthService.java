package com.dajiangtang.auth.service;

import java.time.Clock;
import java.time.Instant;

import org.springframework.stereotype.Service;

import com.dajiangtang.auth.domain.UserAccount;
import com.dajiangtang.auth.dto.AuthResponse;
import com.dajiangtang.auth.dto.LoginRequest;
import com.dajiangtang.auth.dto.RegisterRequest;
import com.dajiangtang.auth.repository.UserAccountRepository;
import com.dajiangtang.common.error.BadRequestException;
import com.dajiangtang.common.error.ConflictException;
import com.dajiangtang.common.error.UnauthorizedException;
import com.dajiangtang.user.domain.UserRole;

@Service
public class AuthService {

    private final UserAccountRepository accountRepository;
    private final PasswordHasher passwordHasher;
    private final Clock clock;

    public AuthService(UserAccountRepository accountRepository, PasswordHasher passwordHasher, Clock clock) {
        this.accountRepository = accountRepository;
        this.passwordHasher = passwordHasher;
        this.clock = clock;
    }

    public AuthResponse register(RegisterRequest request) {
        String username = normalizeUsername(request.username());
        if (!request.password().equals(request.confirmPassword())) {
            throw new BadRequestException("两次输入的密码不一致。");
        }
        if (!"123456".equals(request.smsCode().trim())) {
            throw new BadRequestException("短信验证码不正确。");
        }
        if (accountRepository.existsByUsername(username)) {
            throw new ConflictException("用户名已存在。");
        }

        UserRole role = UserRole.fromToken(request.role())
                .filter(item -> item == UserRole.USER || item == UserRole.COMPANY)
                .orElseThrow(() -> new BadRequestException("注册账号类型仅支持个人用户或企业用户。"));
        UserAccount account = new UserAccount(
                username,
                passwordHasher.hash(request.password()),
                request.phone().trim(),
                role,
                Instant.now(clock)
        );
        accountRepository.save(account);

        return new AuthResponse(account.username(), account.role().name(), "注册成功。");
    }

    public AuthResponse login(LoginRequest request) {
        String username = normalizeUsername(request.username());
        UserAccount account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("用户名或密码错误。"));
        if (!passwordHasher.matches(request.password(), account.passwordHash())) {
            throw new UnauthorizedException("用户名或密码错误。");
        }
        return new AuthResponse(account.username(), account.role().name(), "登录成功。");
    }

    private String normalizeUsername(String username) {
        return username == null ? "" : username.trim();
    }
}
