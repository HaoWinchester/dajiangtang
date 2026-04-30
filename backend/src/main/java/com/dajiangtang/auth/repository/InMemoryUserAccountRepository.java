package com.dajiangtang.auth.repository;

import java.time.Clock;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Repository;

import com.dajiangtang.auth.domain.UserAccount;
import com.dajiangtang.auth.service.PasswordHasher;
import com.dajiangtang.user.domain.UserRole;

@Repository
public class InMemoryUserAccountRepository implements UserAccountRepository {

    private final Map<String, UserAccount> accounts = new ConcurrentHashMap<>();

    public InMemoryUserAccountRepository(PasswordHasher passwordHasher, Clock clock) {
        Instant now = Instant.now(clock);
        save(new UserAccount("admin", passwordHasher.hash("Admin@2026"), "13800000000", UserRole.ADMIN, now));
        save(new UserAccount("cspm_user", passwordHasher.hash("Cspm@2026"), "13800000001", UserRole.USER, now));
        save(new UserAccount("cspm_company", passwordHasher.hash("Cspm@2026"), "13800000002", UserRole.COMPANY, now));
    }

    @Override
    public boolean existsByUsername(String username) {
        return accounts.containsKey(normalize(username));
    }

    @Override
    public Optional<UserAccount> findByUsername(String username) {
        return Optional.ofNullable(accounts.get(normalize(username)));
    }

    @Override
    public UserAccount save(UserAccount account) {
        accounts.put(normalize(account.username()), account);
        return account;
    }

    private String normalize(String username) {
        return username == null ? "" : username.trim().toLowerCase();
    }
}
