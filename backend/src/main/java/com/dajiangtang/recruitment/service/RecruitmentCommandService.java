package com.dajiangtang.recruitment.service;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.dajiangtang.common.error.BadRequestException;
import com.dajiangtang.common.error.ForbiddenException;
import com.dajiangtang.recruitment.domain.Recruitment;
import com.dajiangtang.recruitment.domain.RecruitmentStatus;
import com.dajiangtang.recruitment.dto.RecruitmentCreateRequest;
import com.dajiangtang.recruitment.repository.RecruitmentRepository;
import com.dajiangtang.user.domain.UserRole;

@Service
public class RecruitmentCommandService {

    private final RecruitmentRepository recruitmentRepository;
    private final Clock clock;

    public RecruitmentCommandService(RecruitmentRepository recruitmentRepository, Clock clock) {
        this.recruitmentRepository = recruitmentRepository;
        this.clock = clock;
    }

    public Recruitment create(RecruitmentCreateRequest request, UserRole role) {
        if (!role.canCreateRecruitment()) {
            throw new ForbiddenException("只有管理员可以新增招聘信息。");
        }

        Instant now = Instant.now(clock);
        Recruitment recruitment = new Recruitment(
                nextId(),
                trimRequired(request.position(), "请填写岗位名称。"),
                trimRequired(request.salary(), "请填写薪资。"),
                trimRequired(request.companyName(), "请填写公司。"),
                trimToEmpty(request.department()),
                defaultIfBlank(request.recruitmentPost(), request.position()),
                trimToEmpty(request.jobTags()),
                trimRequired(request.city(), "请填写工作地点。"),
                defaultIfBlank(request.workLocation(), request.city()),
                trimRequired(request.owner(), "请填写负责人。"),
                request.headcount(),
                Boolean.TRUE.equals(request.cspmPreferred()),
                RecruitmentStatus.RECRUITING,
                now,
                now,
                trimRequired(request.contactPhone(), "请填写联系电话。"),
                request.requiredArrivalDate(),
                trimRequired(request.recruitmentProgress(), "请选择招聘进度。"),
                trimRequired(request.jobDescription(), "请填写岗位说明。"),
                trimRequired(request.jobRequirement(), "请填写岗位要求。"),
                trimRequired(request.skillRequirement(), "请填写技能要求。"),
                trimToEmpty(request.welfare()),
                trimToEmpty(request.follower()),
                trimToEmpty(request.level()),
                trimToEmpty(request.remark())
        );

        return recruitmentRepository.save(recruitment);
    }

    private String nextId() {
        return "rec-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }

    private String trimRequired(String value, String message) {
        String trimmed = trimToEmpty(value);
        if (trimmed.isBlank()) {
            throw new BadRequestException(message);
        }
        return trimmed;
    }

    private String defaultIfBlank(String value, String fallback) {
        String trimmed = trimToEmpty(value);
        return trimmed.isBlank() ? trimToEmpty(fallback) : trimmed;
    }

    private String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }
}
