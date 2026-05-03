package com.dajiangtang.recruitment.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.dajiangtang.recruitment.domain.Recruitment;
import com.dajiangtang.recruitment.dto.RecruitmentCreateRequest;
import com.dajiangtang.recruitment.dto.RecruitmentCreateResponse;
import com.dajiangtang.recruitment.dto.RecruitmentDetailResponse;
import com.dajiangtang.recruitment.dto.RecruitmentListQuery;
import com.dajiangtang.recruitment.dto.RecruitmentListResponse;
import com.dajiangtang.recruitment.service.RecruitmentCommandService;
import com.dajiangtang.recruitment.service.RecruitmentDetailService;
import com.dajiangtang.recruitment.service.RecruitmentQueryService;
import com.dajiangtang.security.CurrentUserRoleResolver;
import com.dajiangtang.user.domain.UserRole;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/recruitments")
public class RecruitmentController {

    private final RecruitmentQueryService recruitmentQueryService;
    private final RecruitmentCommandService recruitmentCommandService;
    private final RecruitmentDetailService recruitmentDetailService;
    private final CurrentUserRoleResolver roleResolver;

    public RecruitmentController(
            RecruitmentQueryService recruitmentQueryService,
            RecruitmentCommandService recruitmentCommandService,
            RecruitmentDetailService recruitmentDetailService,
            CurrentUserRoleResolver roleResolver
    ) {
        this.recruitmentQueryService = recruitmentQueryService;
        this.recruitmentCommandService = recruitmentCommandService;
        this.recruitmentDetailService = recruitmentDetailService;
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

    @GetMapping("/{id}")
    public RecruitmentDetailResponse detail(@PathVariable String id) {
        return RecruitmentDetailResponse.from(recruitmentDetailService.get(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RecruitmentCreateResponse create(
            @Valid @RequestBody RecruitmentCreateRequest requestBody,
            HttpServletRequest request
    ) {
        UserRole role = roleResolver.resolve(request);
        Recruitment recruitment = recruitmentCommandService.create(requestBody, role);
        return new RecruitmentCreateResponse(
                recruitment.id(),
                "招聘信息已新增。",
                RecruitmentDetailResponse.from(recruitment)
        );
    }
}
