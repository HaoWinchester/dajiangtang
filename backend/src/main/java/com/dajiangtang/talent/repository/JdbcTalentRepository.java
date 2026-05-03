package com.dajiangtang.talent.repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.dajiangtang.talent.dto.TalentDetailResponse;
import com.dajiangtang.talent.dto.TalentListItemResponse;
import com.dajiangtang.talent.dto.TalentListQuery;

@Repository
@ConditionalOnProperty(name = "app.persistence", havingValue = "jdbc")
public class JdbcTalentRepository implements TalentRepository {

    private final JdbcTemplate jdbcTemplate;

    public JdbcTalentRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<TalentListItemResponse> findAll(TalentListQuery query) {
        String where = whereClause(query);
        String sql = """
                SELECT id, masked_name, gender, job_intention, expected_city, current_company, industry,
                       COALESCE((
                         SELECT GROUP_CONCAT(CONCAT(certificate_name, IFNULL(CONCAT('-', certificate_level), '')) SEPARATOR ',')
                         FROM talent_certificates
                         WHERE talent_id = talents.id
                       ), '') AS certificates
                FROM talents
                %s
                ORDER BY updated_at DESC, id DESC
                LIMIT ? OFFSET ?
                """.formatted(where);
        List<Object> args = args(query);
        args.add(query.pageSize());
        args.add((query.page() - 1) * query.pageSize());
        return jdbcTemplate.query(sql, this::mapListItem, args.toArray());
    }

    @Override
    public Optional<TalentDetailResponse> findById(long id) {
        List<TalentDetailResponse> result = jdbcTemplate.query("""
                SELECT id, masked_name, COALESCE(masked_name, '') AS name, gender, current_company, position_title,
                       current_city, industry, job_intention, expected_city, personal_advantage, profile, contact_owner,
                       COALESCE((
                         SELECT GROUP_CONCAT(CONCAT(certificate_name, IFNULL(CONCAT('-', certificate_level), '')) SEPARATOR ',')
                         FROM talent_certificates
                         WHERE talent_id = talents.id
                       ), '') AS certificates
                FROM talents
                WHERE id = ?
                """, this::mapDetail, id);
        return result.stream().findFirst();
    }

    @Override
    public long count(TalentListQuery query) {
        Long total = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM talents " + whereClause(query), Long.class, args(query).toArray());
        return total == null ? 0 : total;
    }

    @Override
    public long countAll() {
        Long total = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM talents", Long.class);
        return total == null ? 0 : total;
    }

    @Override
    public void upsertFromProfile(String username, Map<String, String> fields) {
        String name = fields.getOrDefault("name", "").trim();
        if (name.isBlank()) {
            return;
        }
        jdbcTemplate.update("""
                INSERT INTO talents (
                    account_username, masked_name, gender, job_intention, expected_city,
                    current_company, position_title, current_city, industry, personal_advantage,
                    profile, contact_owner
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '赵义民')
                ON DUPLICATE KEY UPDATE
                    masked_name = VALUES(masked_name),
                    gender = VALUES(gender),
                    job_intention = VALUES(job_intention),
                    expected_city = VALUES(expected_city),
                    current_company = VALUES(current_company),
                    position_title = VALUES(position_title),
                    current_city = VALUES(current_city),
                    industry = VALUES(industry),
                    personal_advantage = VALUES(personal_advantage),
                    profile = VALUES(profile),
                    contact_owner = VALUES(contact_owner)
                """,
                normalize(username),
                mask(name),
                fields.getOrDefault("gender", ""),
                fields.getOrDefault("jobIntention", ""),
                fields.getOrDefault("city", ""),
                fields.getOrDefault("company", "个人注册用户"),
                fields.getOrDefault("jobIntention", ""),
                fields.getOrDefault("city", ""),
                fields.getOrDefault("industry", ""),
                fields.getOrDefault("personalAdvantage", ""),
                fields.getOrDefault("personalAdvantage", "")
        );
    }

    private TalentListItemResponse mapListItem(ResultSet rs, int row) throws SQLException {
        return new TalentListItemResponse(
                rs.getLong("id"),
                value(rs, "masked_name"),
                value(rs, "gender"),
                value(rs, "job_intention"),
                value(rs, "expected_city"),
                value(rs, "current_company"),
                value(rs, "industry"),
                splitCertificates(value(rs, "certificates"))
        );
    }

    private TalentDetailResponse mapDetail(ResultSet rs, int row) throws SQLException {
        return new TalentDetailResponse(
                rs.getLong("id"),
                value(rs, "masked_name"),
                value(rs, "name"),
                value(rs, "gender"),
                value(rs, "current_company"),
                value(rs, "position_title"),
                value(rs, "current_city"),
                value(rs, "industry"),
                value(rs, "job_intention"),
                value(rs, "expected_city"),
                value(rs, "personal_advantage"),
                value(rs, "profile"),
                value(rs, "contact_owner"),
                splitCertificates(value(rs, "certificates")),
                List.of("赵义民", "贺强", "蔡钰炜")
        );
    }

    private String whereClause(TalentListQuery query) {
        List<String> conditions = conditions(query);
        return conditions.isEmpty()
                ? ""
                : "WHERE " + String.join(" AND ", conditions);
    }

    private List<String> conditions(TalentListQuery query) {
        java.util.ArrayList<String> conditions = new java.util.ArrayList<>();
        if (query.name().isBlank() && query.company().isBlank() && query.industry().isBlank() && query.city().isBlank()) {
            conditions.add("job_intention <> '待完善'");
        }
        if (!query.name().isBlank()) conditions.add("(masked_name LIKE ? OR account_username LIKE ?)");
        if (!query.company().isBlank()) conditions.add("current_company LIKE ?");
        if (!query.industry().isBlank() && !query.industry().contains("不限")) conditions.add("industry LIKE ?");
        if (!query.city().isBlank()) conditions.add("(expected_city LIKE ? OR current_city LIKE ?)");
        return conditions;
    }

    private java.util.ArrayList<Object> args(TalentListQuery query) {
        java.util.ArrayList<Object> args = new java.util.ArrayList<>();
        if (!query.name().isBlank()) {
            args.add(like(query.name()));
            args.add(like(query.name()));
        }
        if (!query.company().isBlank()) args.add(like(query.company()));
        if (!query.industry().isBlank() && !query.industry().contains("不限")) args.add(like(query.industry()));
        if (!query.city().isBlank()) {
            args.add(like(query.city()));
            args.add(like(query.city()));
        }
        return args;
    }

    private String like(String value) {
        return "%" + value.trim().toLowerCase(Locale.ROOT) + "%";
    }

    private String value(ResultSet rs, String column) throws SQLException {
        String value = rs.getString(column);
        return value == null ? "" : value;
    }

    private List<String> splitCertificates(String certificates) {
        if (certificates == null || certificates.isBlank()) {
            return List.of();
        }
        return Arrays.stream(certificates.split(",")).filter(item -> !item.isBlank()).toList();
    }

    private String normalize(String username) {
        return username == null ? "" : username.trim().toLowerCase(Locale.ROOT);
    }

    private String mask(String name) {
        if (name.length() <= 1) {
            return name;
        }
        return name.substring(0, 1) + "*" + name.substring(name.length() - 1);
    }
}
