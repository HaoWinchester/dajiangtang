package com.dajiangtang.application.repository;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.dajiangtang.application.dto.ApplicationResponse;

@Repository
@ConditionalOnProperty(name = "app.persistence", havingValue = "jdbc")
public class JdbcApplicationRepository implements ApplicationRepository {

    private final JdbcTemplate jdbcTemplate;

    public JdbcApplicationRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public ApplicationResponse create(String recruitmentId, String username, String applicantName, String phone, String note) {
        KeyHolder holder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            var statement = connection.prepareStatement("""
                    INSERT INTO recruitment_applications (recruitment_id, account_username, applicant_name, phone, note)
                    VALUES (?, ?, ?, ?, ?)
                    """, java.sql.Statement.RETURN_GENERATED_KEYS);
            statement.setString(1, recruitmentId);
            statement.setString(2, username);
            statement.setString(3, applicantName);
            statement.setString(4, phone);
            statement.setString(5, note);
            return statement;
        }, holder);
        long id = holder.getKey() == null ? 0L : holder.getKey().longValue();
        return new ApplicationResponse(id, recruitmentId, applicantName, phone, "已提交", "申请已提交，平台联系人会尽快跟进。");
    }

    @Override
    public long countAll() {
        Long total = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM recruitment_applications", Long.class);
        return total == null ? 0 : total;
    }
}
