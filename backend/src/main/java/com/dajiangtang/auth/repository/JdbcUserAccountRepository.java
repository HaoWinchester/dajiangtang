package com.dajiangtang.auth.repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Optional;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.dajiangtang.auth.domain.UserAccount;
import com.dajiangtang.user.domain.UserRole;

@Repository
@ConditionalOnProperty(name = "app.persistence", havingValue = "jdbc")
public class JdbcUserAccountRepository implements UserAccountRepository {

    private final JdbcTemplate jdbcTemplate;

    public JdbcUserAccountRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean existsByUsername(String username) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM user_accounts WHERE username = ?",
                Integer.class,
                normalize(username)
        );
        return count != null && count > 0;
    }

    @Override
    public Optional<UserAccount> findByUsername(String username) {
        try {
            UserAccount account = jdbcTemplate.queryForObject("""
                    SELECT username, password_hash, phone, role, created_at
                    FROM user_accounts
                    WHERE username = ?
                    """, this::mapAccount, normalize(username));
            return Optional.ofNullable(account);
        } catch (EmptyResultDataAccessException exception) {
            return Optional.empty();
        }
    }

    @Override
    public UserAccount save(UserAccount account) {
        jdbcTemplate.update("""
                INSERT INTO user_accounts (username, password_hash, phone, role, created_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                normalize(account.username()),
                account.passwordHash(),
                account.phone(),
                account.role().name(),
                Timestamp.from(account.createdAt())
        );
        return account;
    }

    private UserAccount mapAccount(ResultSet resultSet, int rowNumber) throws SQLException {
        return new UserAccount(
                resultSet.getString("username"),
                resultSet.getString("password_hash"),
                resultSet.getString("phone"),
                UserRole.valueOf(resultSet.getString("role")),
                resultSet.getTimestamp("created_at").toInstant()
        );
    }

    private String normalize(String username) {
        return username == null ? "" : username.trim().toLowerCase();
    }
}
