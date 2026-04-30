package com.dajiangtang.recruitment.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dajiangtang.recruitment.dto.RecruitmentListQuery;
import com.dajiangtang.recruitment.dto.RecruitmentListResponse;
import com.dajiangtang.recruitment.service.RecruitmentQueryService;
import com.dajiangtang.security.CurrentUserRoleResolver;
import com.dajiangtang.user.domain.UserRole;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/recruitments")
public class RecruitmentController {

    private final RecruitmentQueryService recruitmentQueryService;
    private final CurrentUserRoleResolver roleResolver;

    public RecruitmentController(RecruitmentQueryService recruitmentQueryService, CurrentUserRoleResolver roleResolver) {
        this.recruitmentQueryService = recruitmentQueryService;
        this.roleResolver = roleResolver;
    }

    @GetMapping
    public RecruitmentListResponse list(
            @RequestParam(required = false) String positionKeyword,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer pageSize,
            HttpServletRequest request
    ) {
        UserRole role = roleResolver.resolve(request);
        RecruitmentListQuery query = RecruitmentListQuery.of(positionKeyword, city, page, pageSize);
        return recruitmentQueryService.list(query, role);
    }
}
