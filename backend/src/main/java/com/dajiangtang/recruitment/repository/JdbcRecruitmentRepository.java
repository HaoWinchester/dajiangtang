package com.dajiangtang.recruitment.repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

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
                       department,
                       recruitment_post,
                       job_tags,
                       city,
                       work_location,
                       owner,
                       headcount,
                       cspm_preferred,
                       status,
                       published_at,
                       updated_at,
                       contact_phone,
                       required_arrival_date,
                       recruitment_progress,
                       job_description,
                       job_requirement,
                       skill_requirement,
                       welfare,
                       follower,
                       level,
                       remark
                FROM recruitments
                """, this::mapRecruitment);
    }

    @Override
    public Optional<Recruitment> findById(String id) {
        List<Recruitment> result = jdbcTemplate.query("""
                SELECT id,
                       position,
                       salary,
                       company_name,
                       department,
                       recruitment_post,
                       job_tags,
                       city,
                       work_location,
                       owner,
                       headcount,
                       cspm_preferred,
                       status,
                       published_at,
                       updated_at,
                       contact_phone,
                       required_arrival_date,
                       recruitment_progress,
                       job_description,
                       job_requirement,
                       skill_requirement,
                       welfare,
                       follower,
                       level,
                       remark
                FROM recruitments
                WHERE id = ?
                """, this::mapRecruitment, id);
        return result.stream().findFirst();
    }

    @Override
    public Recruitment save(Recruitment recruitment) {
        jdbcTemplate.update("""
                INSERT INTO recruitments (
                    id,
                    position,
                    salary,
                    company_name,
                    department,
                    recruitment_post,
                    job_tags,
                    city,
                    work_location,
                    owner,
                    headcount,
                    cspm_preferred,
                    status,
                    contact_phone,
                    published_at,
                    updated_at,
                    required_arrival_date,
                    recruitment_progress,
                    job_description,
                    job_requirement,
                    skill_requirement,
                    welfare,
                    follower,
                    level,
                    remark
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                recruitment.id(),
                recruitment.position(),
                recruitment.salary(),
                recruitment.companyName(),
                recruitment.department(),
                recruitment.recruitmentPost(),
                recruitment.jobTags(),
                recruitment.city(),
                recruitment.workLocation(),
                recruitment.owner(),
                recruitment.headcount(),
                recruitment.cspmPreferred(),
                recruitment.status().name(),
                recruitment.contactPhone(),
                java.sql.Timestamp.from(recruitment.publishedAt()),
                java.sql.Timestamp.from(recruitment.updatedAt()),
                recruitment.requiredArrivalDate(),
                recruitment.recruitmentProgress(),
                recruitment.jobDescription(),
                recruitment.jobRequirement(),
                recruitment.skillRequirement(),
                recruitment.welfare(),
                recruitment.follower(),
                recruitment.level(),
                recruitment.remark()
        );
        return recruitment;
    }

    private Recruitment mapRecruitment(ResultSet resultSet, int rowNumber) throws SQLException {
        return new Recruitment(
                resultSet.getString("id"),
                resultSet.getString("position"),
                resultSet.getString("salary"),
                resultSet.getString("company_name"),
                resultSet.getString("department"),
                resultSet.getString("recruitment_post"),
                resultSet.getString("job_tags"),
                resultSet.getString("city"),
                resultSet.getString("work_location"),
                resultSet.getString("owner"),
                resultSet.getInt("headcount"),
                resultSet.getBoolean("cspm_preferred"),
                RecruitmentStatus.valueOf(resultSet.getString("status")),
                toInstant(resultSet, "published_at"),
                toInstant(resultSet, "updated_at"),
                resultSet.getString("contact_phone"),
                resultSet.getDate("required_arrival_date") == null ? null : resultSet.getDate("required_arrival_date").toLocalDate(),
                resultSet.getString("recruitment_progress"),
                resultSet.getString("job_description"),
                resultSet.getString("job_requirement"),
                resultSet.getString("skill_requirement"),
                resultSet.getString("welfare"),
                resultSet.getString("follower"),
                resultSet.getString("level"),
                resultSet.getString("remark")
        );
    }

    private Instant toInstant(ResultSet resultSet, String columnName) throws SQLException {
        return resultSet.getTimestamp(columnName).toInstant();
    }
}
