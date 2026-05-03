package com.dajiangtang.application.service;

import org.springframework.stereotype.Service;

import com.dajiangtang.application.dto.ApplicationCreateRequest;
import com.dajiangtang.application.dto.ApplicationResponse;
import com.dajiangtang.application.repository.ApplicationRepository;
import com.dajiangtang.common.error.ForbiddenException;
import com.dajiangtang.recruitment.service.RecruitmentDetailService;
import com.dajiangtang.user.domain.UserRole;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final RecruitmentDetailService recruitmentDetailService;

    public ApplicationService(ApplicationRepository applicationRepository, RecruitmentDetailService recruitmentDetailService) {
        this.applicationRepository = applicationRepository;
        this.recruitmentDetailService = recruitmentDetailService;
    }

    public ApplicationResponse create(String recruitmentId, String username, UserRole role, ApplicationCreateRequest request) {
        if (role != UserRole.USER) {
            throw new ForbiddenException("仅普通用户可以提交岗位申请。");
        }
        recruitmentDetailService.get(recruitmentId);
        return applicationRepository.create(
                recruitmentId,
                username,
                request.applicantName().trim(),
                request.phone().trim(),
                request.note() == null ? "" : request.note().trim()
        );
    }

    public long countAll() {
        return applicationRepository.countAll();
    }
}
