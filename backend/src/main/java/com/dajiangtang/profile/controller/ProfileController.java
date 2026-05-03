package com.dajiangtang.profile.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dajiangtang.profile.dto.ProfileModuleRecordRequest;
import com.dajiangtang.profile.dto.ProfileModuleRecordResponse;
import com.dajiangtang.profile.dto.ProfileResponse;
import com.dajiangtang.profile.dto.ProfileSaveRequest;
import com.dajiangtang.profile.service.ProfileService;
import com.dajiangtang.security.CurrentUserRoleResolver;
import com.dajiangtang.user.domain.UserRole;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/me")
public class ProfileController {

    private final CurrentUserRoleResolver userResolver;
    private final ProfileService profileService;

    public ProfileController(CurrentUserRoleResolver userResolver, ProfileService profileService) {
        this.userResolver = userResolver;
        this.profileService = profileService;
    }

    @GetMapping("/profile")
    public ProfileResponse profile(HttpServletRequest request) {
        UserRole role = userResolver.resolve(request);
        return profileService.getProfile(userResolver.resolveUsername(request), role);
    }

    @PutMapping("/profile")
    public ProfileResponse saveProfile(@RequestBody ProfileSaveRequest body, HttpServletRequest request) {
        UserRole role = userResolver.resolve(request);
        return profileService.saveProfile(userResolver.resolveUsername(request), role, body.fields());
    }

    @GetMapping("/profile/modules/{module}")
    public List<ProfileModuleRecordResponse> records(@PathVariable String module, HttpServletRequest request) {
        UserRole role = userResolver.resolve(request);
        return profileService.listRecords(userResolver.resolveUsername(request), role, module);
    }

    @PostMapping("/profile/modules/{module}")
    public ProfileModuleRecordResponse createRecord(
            @PathVariable String module,
            @RequestBody ProfileModuleRecordRequest body,
            HttpServletRequest request
    ) {
        UserRole role = userResolver.resolve(request);
        return profileService.createRecord(userResolver.resolveUsername(request), role, module, body.fields());
    }

    @PutMapping("/profile/modules/{module}/{id}")
    public ProfileModuleRecordResponse updateRecord(
            @PathVariable String module,
            @PathVariable long id,
            @RequestBody ProfileModuleRecordRequest body,
            HttpServletRequest request
    ) {
        UserRole role = userResolver.resolve(request);
        return profileService.updateRecord(userResolver.resolveUsername(request), role, module, id, body.fields());
    }

    @DeleteMapping("/profile/modules/{module}/{id}")
    public Map<String, String> deleteRecord(
            @PathVariable String module,
            @PathVariable long id,
            HttpServletRequest request
    ) {
        UserRole role = userResolver.resolve(request);
        profileService.deleteRecord(userResolver.resolveUsername(request), role, module, id);
        return Map.of("message", "记录已删除。");
    }
}
