package com.dajiangtang.recruitment.repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.util.List;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.dajiangtang.recruitment.domain.Recruitment;
import com.dajiangtang.recruitment.domain.RecruitmentStatus;

@Repository
@ConditionalOnProperty(name = "app.persistence", havingValue = "jdbc")
public class JdbcRecruitmentRepository implements RecruitmentRepository {

    private final JdbcTemplate jdbcTemplate;

    public JdbcRecruitmentRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<Recruitment> findAll() {
        return jdbcTemplate.query("""
                SELECT id,
                       position,
                       salary,
                       company_name,
                       city,
                       owner,
                       headcount,
                       cspm_preferred,
                       status,
                       published_at,
                       updated_at,
                       contact_phone
                FROM recruitments
                """, this::mapRecruitment);
    }

    private Recruitment mapRecruitment(ResultSet resultSet, int rowNumber) throws SQLException {
        return new Recruitment(
                resultSet.getString("id"),
                resultSet.getString("position"),
                resultSet.getString("salary"),
                resultSet.getString("company_name"),
                resultSet.getString("city"),
                resultSet.getString("owner"),
                resultSet.getInt("headcount"),
                resultSet.getBoolean("cspm_preferred"),
                RecruitmentStatus.valueOf(resultSet.getString("status")),
                toInstant(resultSet, "published_at"),
                toInstant(resultSet, "updated_at"),
                resultSet.getString("contact_phone")
        );
    }

    private Instant toInstant(ResultSet resultSet, String columnName) throws SQLException {
        return resultSet.getTimestamp(columnName).toInstant();
    }
}
