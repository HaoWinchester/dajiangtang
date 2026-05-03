package com.dajiangtang.home.service;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;

import com.dajiangtang.home.dto.HomeRecruitmentItemResponse;
import com.dajiangtang.recruitment.domain.Recruitment;
import com.dajiangtang.recruitment.repository.RecruitmentRepository;

@Service
public class HomeRecruitmentService {

    private static final int HOME_RECRUITMENT_LIMIT = 5;

    private final RecruitmentRepository recruitmentRepository;

    public HomeRecruitmentService(RecruitmentRepository recruitmentRepository) {
        this.recruitmentRepository = recruitmentRepository;
    }

    public List<HomeRecruitmentItemResponse> listFeaturedRecruitments() {
        return recruitmentRepository.findAll().stream()
                .filter(recruitment -> recruitment.status().isVisibleInDefaultList())
                .sorted(Comparator.comparing(Recruitment::latestActivityAt).reversed())
                .limit(HOME_RECRUITMENT_LIMIT)
                .map(HomeRecruitmentItemResponse::from)
                .toList();
    }
}
