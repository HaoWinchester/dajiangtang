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
        return profileRepository.createModuleRecord(username, module, fields);
    }

    public ProfileModuleRecordResponse updateRecord(String username, UserRole role, String module, long id, Map<String, String> fields) {
        ensureUser(role);
        ensureModule(module);
        ensureHasContent(fields);
        return profileRepository.updateModuleRecord(username, module, id, fields)
                .orElseThrow(() -> new BadRequestException("记录不存在或不属于当前账号。"));
    }

    public void deleteRecord(String username, UserRole role, String module, long id) {
        ensureUser(role);
        ensureModule(module);
        if (!profileRepository.deleteModuleRecord(username, module, id)) {
            throw new BadRequestException("记录不存在或不属于当前账号。");
        }
    }

    private void ensureUser(UserRole role) {
        if (role != UserRole.USER) {
            throw new ForbiddenException("仅普通用户可以维护个人资料。");
        }
    }

    private void ensureModule(String module) {
        if (!ALLOWED_MODULES.contains(module)) {
            throw new BadRequestException("资料模块不存在。");
        }
    }

    private void ensureHasContent(Map<String, String> fields) {
        boolean hasContent = fields != null && fields.values().stream()
                .anyMatch(value -> value != null && !value.isBlank());
        if (!hasContent) {
            throw new BadRequestException("请先填写记录内容。");
        }
    }
}
