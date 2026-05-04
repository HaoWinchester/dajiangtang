package com.dajiangtang.profile.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.dajiangtang.common.error.BadRequestException;
import com.dajiangtang.common.error.ForbiddenException;
import com.dajiangtang.profile.dto.ProfileModuleRecordResponse;
import com.dajiangtang.profile.dto.ProfileResponse;
import com.dajiangtang.profile.repository.ProfileRepository;
import com.dajiangtang.talent.service.TalentSyncService;
import com.dajiangtang.user.domain.UserRole;

@Service
public class ProfileService {

    private static final List<String> ALLOWED_MODULES = List.of(
            "work-experience",
            "project-experience",
            "honors",
            "education-experience",
            "professional-skills",
            "certificates"
    );

    private final ProfileRepository profileRepository;
    private final TalentSyncService talentSyncService;

    public ProfileService(ProfileRepository profileRepository, TalentSyncService talentSyncService) {
        this.profileRepository = profileRepository;
        this.talentSyncService = talentSyncService;
    }

    public ProfileResponse getProfile(String username, UserRole role) {
        ensureUser(role);
        return new ProfileResponse(username, profileRepository.findProfileFields(username));
    }

    public ProfileResponse saveProfile(String username, UserRole role, Map<String, String> fields) {
        ensureUser(role);
        Map<String, String> saved = profileRepository.saveProfileFields(username, fields);
        talentSyncService.syncProfile(username, saved);
        return new ProfileResponse(username, saved);
    }

    public List<ProfileModuleRecordResponse> listRecords(String username, UserRole role, String module) {
        ensureUser(role);
        ensureModule(module);
        return profileRepository.findModuleRecords(username, module);
    }

    public ProfileModuleRecordResponse createRecord(String username, UserRole role, String module, Map<String, String> fields) {
        ensureUser(role);
        ensureModule(module);
        ensureHasContent(fields);
        ProfileModuleRecordResponse record = profileRepository.createModuleRecord(username, module, fields);
        syncCertificatesIfNeeded(username, module);
        return record;
    }

    public ProfileModuleRecordResponse updateRecord(String username, UserRole role, String module, long id, Map<String, String> fields) {
        ensureUser(role);
        ensureModule(module);
        ensureHasContent(fields);
        ProfileModuleRecordResponse record = profileRepository.updateModuleRecord(username, module, id, fields)
                .orElseThrow(() -> new BadRequestException("\u8bb0\u5f55\u4e0d\u5b58\u5728\u6216\u4e0d\u5c5e\u4e8e\u5f53\u524d\u8d26\u53f7\u3002"));
        syncCertificatesIfNeeded(username, module);
        return record;
    }

    public void deleteRecord(String username, UserRole role, String module, long id) {
        ensureUser(role);
        ensureModule(module);
        if (!profileRepository.deleteModuleRecord(username, module, id)) {
            throw new BadRequestException("\u8bb0\u5f55\u4e0d\u5b58\u5728\u6216\u4e0d\u5c5e\u4e8e\u5f53\u524d\u8d26\u53f7\u3002");
        }
        syncCertificatesIfNeeded(username, module);
    }

    private void syncCertificatesIfNeeded(String username, String module) {
        if (!"certificates".equals(module)) {
            return;
        }
        List<Map<String, String>> records = profileRepository.findModuleRecords(username, module).stream()
                .map(ProfileModuleRecordResponse::fields)
                .toList();
        talentSyncService.syncCertificates(username, records);
    }

    private void ensureUser(UserRole role) {
        if (role != UserRole.USER) {
            throw new ForbiddenException("\u4ec5\u666e\u901a\u7528\u6237\u53ef\u4ee5\u7ef4\u62a4\u4e2a\u4eba\u8d44\u6599\u3002");
        }
    }

    private void ensureModule(String module) {
        if (!ALLOWED_MODULES.contains(module)) {
            throw new BadRequestException("\u8d44\u6599\u6a21\u5757\u4e0d\u5b58\u5728\u3002");
        }
    }

    private void ensureHasContent(Map<String, String> fields) {
        boolean hasContent = fields != null && fields.values().stream()
                .anyMatch(value -> value != null && !value.isBlank());
        if (!hasContent) {
            throw new BadRequestException("\u8bf7\u5148\u586b\u5199\u8bb0\u5f55\u5185\u5bb9\u3002");
        }
    }
}
