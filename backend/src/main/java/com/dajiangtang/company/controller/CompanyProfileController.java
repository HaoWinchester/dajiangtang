package com.dajiangtang.company.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dajiangtang.company.dto.CompanyProfileResponse;
import com.dajiangtang.company.dto.CompanyProfileSaveRequest;
import com.dajiangtang.company.service.CompanyProfileService;
import com.dajiangtang.security.CurrentUserRoleResolver;
import com.dajiangtang.user.domain.UserRole;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/me/company-profile")
public class CompanyProfileController {

    private final CurrentUserRoleResolver userResolver;
    private final CompanyProfileService companyProfileService;

    public CompanyProfileController(CurrentUserRoleResolver userResolver, CompanyProfileService companyProfileService) {
        this.userResolver = userResolver;
        this.companyProfileService = companyProfileService;
    }

    @GetMapping
    public CompanyProfileResponse profile(HttpServletRequest request) {
        UserRole role = userResolver.resolve(request);
        return companyProfileService.getProfile(userResolver.resolveUsername(request), role);
    }

    @PutMapping
    public CompanyProfileResponse saveProfile(@RequestBody CompanyProfileSaveRequest body, HttpServletRequest request) {
        UserRole role = userResolver.resolve(request);
        return companyProfileService.saveProfile(userResolver.resolveUsername(request), role, body.fields());
    }
}
