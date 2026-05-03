package com.dajiangtang.profile.repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.dajiangtang.profile.dto.ProfileModuleRecordResponse;

public interface ProfileRepository {

    Map<String, String> findProfileFields(String username);

    Map<String, String> saveProfileFields(String username, Map<String, String> fields);

    List<ProfileModuleRecordResponse> findModuleRecords(String username, String module);

    ProfileModuleRecordResponse createModuleRecord(String username, String module, Map<String, String> fields);

    Optional<ProfileModuleRecordResponse> updateModuleRecord(String username, String module, long id, Map<String, String> fields);

    boolean deleteModuleRecord(String username, String module, long id);
}
