package com.dajiangtang.application.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.dajiangtang.application.dto.ApplicationCreateRequest;
import com.dajiangtang.application.dto.ApplicationResponse;
import com.dajiangtang.application.service.ApplicationService;
import com.dajiangtang.security.CurrentUserRoleResolver;
import com.dajiangtang.user.domain.UserRole;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/recruitments/{recruitmentId}/applications")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final CurrentUserRoleResolver roleResolver;

    public ApplicationController(ApplicationService applicationService, CurrentUserRoleResolver roleResolver) {
        this.applicationService = applicationService;
        this.roleResolver = roleResolver;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationResponse create(
            @PathVariable String recruitmentId,
            @Valid @RequestBody ApplicationCreateRequest body,
            HttpServletRequest request
    ) {
        UserRole role = roleResolver.resolve(request);
        return applicationService.create(recruitmentId, roleResolver.resolveUsername(request), role, body);
    }
}
