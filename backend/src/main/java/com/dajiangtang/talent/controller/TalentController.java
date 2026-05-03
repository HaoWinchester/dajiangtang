package com.dajiangtang.talent.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dajiangtang.security.CurrentUserRoleResolver;
import com.dajiangtang.talent.dto.TalentDetailResponse;
import com.dajiangtang.talent.dto.TalentListQuery;
import com.dajiangtang.talent.dto.TalentListResponse;
import com.dajiangtang.talent.service.TalentService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/talents")
public class TalentController {

    private final TalentService talentService;
    private final CurrentUserRoleResolver roleResolver;

    public TalentController(TalentService talentService, CurrentUserRoleResolver roleResolver) {
        this.talentService = talentService;
        this.roleResolver = roleResolver;
    }

    @GetMapping
    public TalentListResponse list(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String industry,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer pageSize,
            HttpServletRequest request
    ) {
        roleResolver.resolve(request);
        return talentService.list(TalentListQuery.of(name, company, industry, city, page, pageSize));
    }

    @GetMapping("/{id}")
    public TalentDetailResponse detail(@PathVariable long id, HttpServletRequest request) {
        roleResolver.resolve(request);
        return talentService.detail(id);
    }
}
