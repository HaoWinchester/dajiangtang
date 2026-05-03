package com.dajiangtang.profile.repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.dajiangtang.profile.dto.ProfileModuleRecordResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Repository
@ConditionalOnProperty(name = "app.persistence", havingValue = "jdbc")
public class JdbcProfileRepository implements ProfileRepository {

    private static final TypeReference<Map<String, String>> STRING_MAP = new TypeReference<>() {
    };

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public JdbcProfileRepository(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public Map<String, String> findProfileFields(String username) {
        try {
            return jdbcTemplate.queryForObject("""
                    SELECT name, gender, ethnicity, birthday, native_place, political_status,
                           job_intention, expected_salary, phone, address, email, city, industry,
                           personal_advantage
                    FROM personal_profiles
                    WHERE account_username = ?
                    """, this::mapProfile, normalize(username));
        } catch (EmptyResultDataAccessException exception) {
            return new LinkedHashMap<>();
        }
    }

    @Override
    public Map<String, String> saveProfileFields(String username, Map<String, String> fields) {
        Map<String, String> cleaned = clean(fields);
        jdbcTemplate.update("""
                INSERT INTO personal_profiles (
                    account_username, name, gender, ethnicity, birthday, native_place,
                    political_status, job_intention, expected_salary, phone, address,
                    email, city, industry, personal_advantage
                ) VALUES (?, ?, ?, ?, NULLIF(?, ''), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    name = VALUES(name),
                    gender = VALUES(gender),
                    ethnicity = VALUES(ethnicity),
                    birthday = VALUES(birthday),
                    native_place = VALUES(native_place),
                    political_status = VALUES(political_status),
                    job_intention = VALUES(job_intention),
                    expected_salary = VALUES(expected_salary),
                    phone = VALUES(phone),
                    address = VALUES(address),
                    email = VALUES(email),
                    city = VALUES(city),
                    industry = VALUES(industry),
                    personal_advantage = VALUES(personal_advantage)
                """,
                normalize(username),
                cleaned.getOrDefault("name", ""),
                cleaned.getOrDefault("gender", ""),
                cleaned.getOrDefault("ethnicity", ""),
                cleaned.getOrDefault("birthday", ""),
                cleaned.getOrDefault("nativePlace", ""),
                cleaned.getOrDefault("politicalStatus", ""),
                cleaned.getOrDefault("jobIntention", ""),
                cleaned.getOrDefault("expectedSalary", ""),
                cleaned.getOrDefault("phone", ""),
                cleaned.getOrDefault("address", ""),
                cleaned.getOrDefault("email", ""),
                cleaned.getOrDefault("city", ""),
                cleaned.getOrDefault("industry", ""),
                cleaned.getOrDefault("personalAdvantage", "")
        );
        return findProfileFields(username);
    }

    @Override
    public List<ProfileModuleRecordResponse> findModuleRecords(String username, String module) {
        return jdbcTemplate.query("""
                SELECT id, module_name, fields_json
                FROM profile_module_records
                WHERE account_username = ? AND module_name = ?
                ORDER BY id
                """, this::mapModuleRecord, normalize(username), module);
    }

    @Override
    public ProfileModuleRecordResponse createModuleRecord(String username, String module, Map<String, String> fields) {
        KeyHolder holder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            var statement = connection.prepareStatement("""
                    INSERT INTO profile_module_records (account_username, module_name, fields_json)
                    VALUES (?, ?, ?)
                    """, java.sql.Statement.RETURN_GENERATED_KEYS);
            statement.setString(1, normalize(username));
            statement.setString(2, module);
            statement.setString(3, toJson(clean(fields)));
            return statement;
        }, holder);
        long id = holder.getKey() == null ? 0L : holder.getKey().longValue();
        return new ProfileModuleRecordResponse(id, module, clean(fields));
    }

    @Override
    public Optional<ProfileModuleRecordResponse> updateModuleRecord(String username, String module, long id, Map<String, String> fields) {
        int affected = jdbcTemplate.update("""
                UPDATE profile_module_records
                SET fields_json = ?
                WHERE id = ? AND account_username = ? AND module_name = ?
                """, toJson(clean(fields)), id, normalize(username), module);
        if (affected == 0) {
            return Optional.empty();
        }
        return Optional.of(new ProfileModuleRecordResponse(id, module, clean(fields)));
    }

    @Override
    public boolean deleteModuleRecord(String username, String module, long id) {
        int affected = jdbcTemplate.update("""
                DELETE FROM profile_module_records
                WHERE id = ? AND account_username = ? AND module_name = ?
                """, id, normalize(username), module);
        return affected > 0;
    }

    private Map<String, String> mapProfile(ResultSet resultSet, int rowNumber) throws SQLException {
        Map<String, String> fields = new LinkedHashMap<>();
        fields.put("name", value(resultSet, "name"));
        fields.put("gender", value(resultSet, "gender"));
        fields.put("ethnicity", value(resultSet, "ethnicity"));
        fields.put("birthday", resultSet.getDate("birthday") == null ? "" : resultSet.getDate("birthday").toLocalDate().toString());
        fields.put("nativePlace", value(resultSet, "native_place"));
        fields.put("politicalStatus", value(resultSet, "political_status"));
        fields.put("jobIntention", value(resultSet, "job_intention"));
        fields.put("expectedSalary", value(resultSet, "expected_salary"));
        fields.put("phone", value(resultSet, "phone"));
        fields.put("address", value(resultSet, "address"));
        fields.put("email", value(resultSet, "email"));
        fields.put("city", value(resultSet, "city"));
        fields.put("industry", value(resultSet, "industry"));
        fields.put("personalAdvantage", value(resultSet, "personal_advantage"));
        return fields;
    }

    private ProfileModuleRecordResponse mapModuleRecord(ResultSet resultSet, int rowNumber) throws SQLException {
        return new ProfileModuleRecordResponse(
                resultSet.getLong("id"),
                resultSet.getString("module_name"),
                fromJson(resultSet.getString("fields_json"))
        );
    }

    private Map<String, String> clean(Map<String, String> fields) {
        Map<String, String> cleaned = new LinkedHashMap<>();
        if (fields == null) {
            return cleaned;
        }
        fields.forEach((key, value) -> {
            if (key != null) {
                cleaned.put(key.trim(), value == null ? "" : value.trim());
            }
        });
        return cleaned;
    }

    private String normalize(String username) {
        return username == null ? "" : username.trim().toLowerCase();
    }

    private String value(ResultSet resultSet, String column) throws SQLException {
        String value = resultSet.getString(column);
        return value == null ? "" : value;
    }

    private String toJson(Map<String, String> fields) {
        try {
            return objectMapper.writeValueAsString(fields);
        } catch (JsonProcessingException exception) {
            throw new IllegalArgumentException("资料字段序列化失败。", exception);
        }
    }

    private Map<String, String> fromJson(String json) {
        try {
            return objectMapper.readValue(json == null || json.isBlank() ? "{}" : json, STRING_MAP);
        } catch (JsonProcessingException exception) {
            return new LinkedHashMap<>();
        }
    }
}
