package com.dajiangtang.profile.repository;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;

import com.dajiangtang.profile.dto.ProfileModuleRecordResponse;

@Repository
@ConditionalOnProperty(name = "app.persistence", havingValue = "memory", matchIfMissing = true)
public class InMemoryProfileRepository implements ProfileRepository {

    private final Map<String, Map<String, String>> profiles = new HashMap<>();
    private final Map<String, List<ProfileModuleRecordResponse>> records = new HashMap<>();
    private final AtomicLong ids = new AtomicLong(1);

    @Override
    public synchronized Map<String, String> findProfileFields(String username) {
        return new LinkedHashMap<>(profiles.getOrDefault(normalize(username), Map.of()));
    }

    @Override
    public synchronized Map<String, String> saveProfileFields(String username, Map<String, String> fields) {
        Map<String, String> cleaned = clean(fields);
        profiles.put(normalize(username), cleaned);
        return new LinkedHashMap<>(cleaned);
    }

    @Override
    public synchronized List<ProfileModuleRecordResponse> findModuleRecords(String username, String module) {
        return List.copyOf(records.getOrDefault(key(username, module), List.of()));
    }

    @Override
    public synchronized ProfileModuleRecordResponse createModuleRecord(String username, String module, Map<String, String> fields) {
        String key = key(username, module);
        List<ProfileModuleRecordResponse> list = new ArrayList<>(records.getOrDefault(key, List.of()));
        ProfileModuleRecordResponse record = new ProfileModuleRecordResponse(ids.getAndIncrement(), module, clean(fields));
        list.add(record);
        records.put(key, list);
        return record;
    }

    @Override
    public synchronized Optional<ProfileModuleRecordResponse> updateModuleRecord(String username, String module, long id, Map<String, String> fields) {
        String key = key(username, module);
        List<ProfileModuleRecordResponse> list = new ArrayList<>(records.getOrDefault(key, List.of()));
        for (int index = 0; index < list.size(); index += 1) {
            ProfileModuleRecordResponse record = list.get(index);
            if (record.id() == id) {
                ProfileModuleRecordResponse updated = new ProfileModuleRecordResponse(id, module, clean(fields));
                list.set(index, updated);
                records.put(key, list);
                return Optional.of(updated);
            }
        }
        return Optional.empty();
    }

    @Override
    public synchronized boolean deleteModuleRecord(String username, String module, long id) {
        String key = key(username, module);
        List<ProfileModuleRecordResponse> list = new ArrayList<>(records.getOrDefault(key, List.of()));
        boolean removed = list.removeIf(record -> record.id() == id);
        records.put(key, list);
        return removed;
    }

    private String key(String username, String module) {
        return normalize(username) + ":" + module;
    }

    private String normalize(String username) {
        return username == null ? "" : username.trim().toLowerCase();
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
}
