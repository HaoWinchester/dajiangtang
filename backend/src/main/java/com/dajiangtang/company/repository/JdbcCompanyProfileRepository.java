package com.dajiangtang.company.repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Repository
@ConditionalOnProperty(name = "app.persistence", havingValue = "jdbc")
public class JdbcCompanyProfileRepository implements CompanyProfileRepository {

    private static final TypeReference<Map<String, Object>> FIELD_MAP = new TypeReference<>() {
    };

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public JdbcCompanyProfileRepository(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public Map<String, Object> findCompanyFields(String username) {
        try {
            return jdbcTemplate.queryForObject("""
                    SELECT fields_json
                    FROM companies
                    WHERE account_username = ?
                    """, this::mapFields, normalize(username));
        } catch (EmptyResultDataAccessException exception) {
            return new LinkedHashMap<>();
        }
    }

    @Override
    public Map<String, Object> saveCompanyFields(String username, Map<String, Object> fields) {
        Map<String, Object> cleaned = clean(fields);
        jdbcTemplate.update("""
                INSERT INTO companies (
                    account_username, company_type, company_name, full_name, company_size,
                    industry, city, contact_name, work_time, welfare_insurance,
                    welfare_allowance, maintainer, phone, website, address, email,
                    description, status, user_level, remark, fields_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    company_type = VALUES(company_type),
                    company_name = VALUES(company_name),
                    full_name = VALUES(full_name),
                    company_size = VALUES(company_size),
                    industry = VALUES(industry),
                    city = VALUES(city),
                    contact_name = VALUES(contact_name),
                    work_time = VALUES(work_time),
                    welfare_insurance = VALUES(welfare_insurance),
                    welfare_allowance = VALUES(welfare_allowance),
                    maintainer = VALUES(maintainer),
                    phone = VALUES(phone),
                    website = VALUES(website),
                    address = VALUES(address),
                    email = VALUES(email),
                    description = VALUES(description),
                    status = VALUES(status),
                    user_level = VALUES(user_level),
                    remark = VALUES(remark),
                    fields_json = VALUES(fields_json)
                """,
                normalize(username),
                text(cleaned, "公司类型"),
                textOrDefault(cleaned, "公司名称 *", "未命名企业"),
                firstText(cleaned, "公司全称", "公司名称 *"),
                text(cleaned, "人员规模"),
                text(cleaned, "所属行业"),
                firstText(cleaned, "所在城市", "field-12"),
                text(cleaned, "联系人姓名"),
                workTime(cleaned),
                benefits(cleaned, "五险一金"),
                benefits(cleaned, "餐补/交通补助"),
                text(cleaned, "维护人"),
                text(cleaned, "企业总机"),
                text(cleaned, "官方网址"),
                text(cleaned, "详细办公地址"),
                text(cleaned, "商务邮箱"),
                text(cleaned, "客户简介"),
                radioStatus(cleaned),
                userLevel(cleaned),
                text(cleaned, "输入仅内部可见的备注信息..."),
                toJson(cleaned)
        );
        return findCompanyFields(username);
    }

    private Map<String, Object> mapFields(ResultSet resultSet, int rowNumber) throws SQLException {
        return fromJson(resultSet.getString("fields_json"));
    }

    private Map<String, Object> clean(Map<String, Object> fields) {
        Map<String, Object> cleaned = new LinkedHashMap<>();
        if (fields == null) {
            return cleaned;
        }
        fields.forEach((key, value) -> {
            if (key == null) {
                return;
            }
            if (value instanceof Boolean booleanValue) {
                cleaned.put(key.trim(), booleanValue);
            } else {
                cleaned.put(key.trim(), value == null ? "" : String.valueOf(value).trim());
            }
        });
        return cleaned;
    }

    private String normalize(String username) {
        return username == null ? "" : username.trim().toLowerCase();
    }

    private String text(Map<String, Object> fields, String key) {
        Object value = fields.get(key);
        return value == null ? "" : String.valueOf(value).trim();
    }

    private String textOrDefault(Map<String, Object> fields, String key, String defaultValue) {
        String value = text(fields, key);
        return value.isBlank() ? defaultValue : value;
    }

    private String firstText(Map<String, Object> fields, String... keys) {
        for (String key : keys) {
            String value = text(fields, key);
            if (!value.isBlank()) {
                return value;
            }
        }
        return "";
    }

    private String workTime(Map<String, Object> fields) {
        String start = firstText(fields, "field-17");
        String end = firstText(fields, "field-18");
        if (start.isBlank() && end.isBlank()) {
            return "";
        }
        return start + "-" + end;
    }

    private String benefits(Map<String, Object> fields, String contains) {
        return fields.entrySet().stream()
                .filter(entry -> entry.getValue() instanceof Boolean checked && checked)
                .map(Map.Entry::getKey)
                .filter(key -> key.contains(contains))
                .findFirst()
                .orElse("");
    }

    private String radioStatus(Map<String, Object> fields) {
        if (Boolean.TRUE.equals(fields.get("status"))) {
            return "活跃";
        }
        return "";
    }

    private String userLevel(Map<String, Object> fields) {
        return fields.entrySet().stream()
                .filter(entry -> entry.getValue() instanceof Boolean checked && checked)
                .map(Map.Entry::getKey)
                .filter(key -> key.contains("重点") || key.contains("一般"))
                .findFirst()
                .map(key -> key.contains("重点") ? "重点用户" : "一般用户")
                .orElse("一般用户");
    }

    private String toJson(Map<String, Object> fields) {
        try {
            return objectMapper.writeValueAsString(fields);
        } catch (JsonProcessingException exception) {
            throw new IllegalArgumentException("企业资料字段序列化失败。", exception);
        }
    }

    private Map<String, Object> fromJson(String json) {
        try {
            return objectMapper.readValue(json == null || json.isBlank() ? "{}" : json, FIELD_MAP);
        } catch (JsonProcessingException exception) {
            return new LinkedHashMap<>();
        }
    }
}
