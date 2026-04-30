package com.dajiangtang.auth.repository;

import java.util.Optional;

import com.dajiangtang.auth.domain.UserAccount;

public interface UserAccountRepository {

    boolean existsByUsername(String username);

    Optional<UserAccount> findByUsername(String username);

    UserAccount save(UserAccount account);
}
