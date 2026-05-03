package com.dajiangtang.recruitment.service;

import org.springframework.stereotype.Service;

import com.dajiangtang.common.error.BadRequestException;
import com.dajiangtang.recruitment.domain.Recruitment;
import com.dajiangtang.recruitment.repository.RecruitmentRepository;

@Service
public class RecruitmentDetailService {

    private final RecruitmentRepository recruitmentRepository;

    public RecruitmentDetailService(RecruitmentRepository recruitmentRepository) {
        this.recruitmentRepository = recruitmentRepository;
    }

    public Recruitment get(String id) {
        if (id == null || id.isBlank()) {
            throw new BadRequestException("招聘信息不存在。");
        }

        return recruitmentRepository.findById(id.trim())
                .orElseThrow(() -> new BadRequestException("招聘信息不存在。"));
    }
}
