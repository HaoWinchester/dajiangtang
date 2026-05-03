package com.dajiangtang.analytics.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dajiangtang.analytics.dto.AnalyticsResponse;
import com.dajiangtang.application.service.ApplicationService;
import com.dajiangtang.recruitment.repository.RecruitmentRepository;
import com.dajiangtang.security.CurrentUserRoleResolver;
import com.dajiangtang.talent.service.TalentService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final RecruitmentRepository recruitmentRepository;
    private final TalentService talentService;
    private final ApplicationService applicationService;
    private final CurrentUserRoleResolver roleResolver;

    public AnalyticsController(
            RecruitmentRepository recruitmentRepository,
            TalentService talentService,
            ApplicationService applicationService,
            CurrentUserRoleResolver roleResolver
    ) {
        this.recruitmentRepository = recruitmentRepository;
        this.talentService = talentService;
        this.applicationService = applicationService;
        this.roleResolver = roleResolver;
    }

    @GetMapping
    public AnalyticsResponse get(HttpServletRequest request) {
        roleResolver.resolve(request);
        long recruitments = recruitmentRepository.findAll().stream()
                .filter(item -> item.status().isVisibleInDefaultList())
                .count();
        long talents = talentService.countAll();
        long applications = applicationService.countAll();
        return new AnalyticsResponse(recruitments, talents, applications, talents == 0 ? 0 : 82.5, "北京");
    }
}
