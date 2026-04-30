package com.dajiangtang.recruitment.service;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;

import com.dajiangtang.common.domain.CityCatalog;
import com.dajiangtang.recruitment.domain.Recruitment;
import com.dajiangtang.recruitment.dto.RecruitmentListItemResponse;
import com.dajiangtang.recruitment.dto.RecruitmentListQuery;
import com.dajiangtang.recruitment.dto.RecruitmentListResponse;
import com.dajiangtang.recruitment.repository.RecruitmentRepository;
import com.dajiangtang.security.CurrentUserRoleResolver;
import com.dajiangtang.user.domain.UserRole;

@Service
public class RecruitmentQueryService {

    private final RecruitmentRepository recruitmentRepository;
    private final CityCatalog cityCatalog;
    private final CurrentUserRoleResolver roleResolver;

    public RecruitmentQueryService(
            RecruitmentRepository recruitmentRepository,
            CityCatalog cityCatalog,
            CurrentUserRoleResolver roleResolver
    ) {
        this.recruitmentRepository = recruitmentRepository;
        this.cityCatalog = cityCatalog;
        this.roleResolver = roleResolver;
    }

    public RecruitmentListResponse list(RecruitmentListQuery query, UserRole role) {
        List<Recruitment> matched = recruitmentRepository.findAll().stream()
                .filter(recruitment -> recruitment.status().isVisibleInDefaultList())
                .filter(recruitment -> matchesPosition(recruitment, query))
                .filter(recruitment -> matchesCity(recruitment, query))
                .sorted(Comparator.comparing(Recruitment::latestActivityAt).reversed())
                .toList();

        long totalItems = matched.size();
        int totalPages = totalItems == 0 ? 0 : (int) Math.ceil((double) totalItems / query.pageSize());
        int start = Math.min((query.page() - 1) * query.pageSize(), matched.size());
        int end = Math.min(start + query.pageSize(), matched.size());

        List<RecruitmentListItemResponse> items = matched.subList(start, end).stream()
                .map(RecruitmentListItemResponse::from)
                .toList();

        return new RecruitmentListResponse(
                items,
                query.page(),
                query.pageSize(),
                totalItems,
                totalPages,
                roleResolver.canCreateRecruitment(role)
        );
    }

    private boolean matchesPosition(Recruitment recruitment, RecruitmentListQuery query) {
        if (!query.hasPositionKeyword()) {
            return true;
        }
        return recruitment.position()
                .toLowerCase(Locale.ROOT)
                .contains(query.positionKeyword().toLowerCase(Locale.ROOT));
    }

    private boolean matchesCity(Recruitment recruitment, RecruitmentListQuery query) {
        if (!query.hasCity()) {
            return true;
        }
        return cityCatalog.isStandardCityName(query.city()) && recruitment.city().equals(query.city());
    }
}
