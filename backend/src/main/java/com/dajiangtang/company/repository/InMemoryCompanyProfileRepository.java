package com.dajiangtang.company.repository;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;

@Repository
@ConditionalOnProperty(name = "app.persistence", havingValue = "memory", matchIfMissing = true)
public class InMemoryCompanyProfileRepository implements CompanyProfileRepository {

    private final Map<String, Map<String, Object>> companies = new ConcurrentHashMap<>();

    @Override
    public Map<String, Object> findCompanyFields(String username) {
        return new LinkedHashMap<>(companies.getOrDefault(normalize(username), Map.of()));
    }

    @Override
    public Map<String, Object> saveCompanyFields(String username, Map<String, Object> fields) {
        Map<String, Object> cleaned = clean(fields);
        companies.put(normalize(username), cleaned);
        return new LinkedHashMap<>(cleaned);
    }

    private String normalize(String username) {
        return username == null ? "" : username.trim().toLowerCase();
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
}
