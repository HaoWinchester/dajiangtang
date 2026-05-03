package com.dajiangtang.upload.repository;

import java.util.Optional;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.dajiangtang.upload.dto.UploadImageResponse;

@Repository
@ConditionalOnProperty(name = "app.persistence", havingValue = "jdbc")
public class JdbcUploadImageRepository implements UploadImageRepository {

    private final JdbcTemplate jdbcTemplate;

    public JdbcUploadImageRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public Optional<UploadImageResponse> find(String username, String pagePath, String target) {
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject("""
                    SELECT account_username, page_path, target, data_url
                    FROM user_uploads
                    WHERE account_username = ? AND page_path = ? AND target = ?
                    """, (rs, rowNum) -> new UploadImageResponse(
                    rs.getString("account_username"),
                    rs.getString("page_path"),
                    rs.getString("target"),
                    rs.getString("data_url")
            ), normalize(username), normalizePath(pagePath), target));
        } catch (EmptyResultDataAccessException exception) {
            return Optional.empty();
        }
    }

    @Override
    public UploadImageResponse save(String username, String pagePath, String target, String dataUrl) {
        jdbcTemplate.update("""
                INSERT INTO user_uploads (account_username, page_path, target, data_url)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE data_url = VALUES(data_url)
                """, normalize(username), normalizePath(pagePath), target, dataUrl);
        return new UploadImageResponse(normalize(username), normalizePath(pagePath), target, dataUrl);
    }

    private String normalize(String username) {
        return username == null ? "" : username.trim().toLowerCase();
    }

    private String normalizePath(String pagePath) {
        return pagePath == null || pagePath.isBlank() ? "/" : pagePath.trim();
    }
}
