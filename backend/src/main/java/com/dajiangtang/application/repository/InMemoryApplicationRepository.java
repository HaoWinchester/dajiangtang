package com.dajiangtang.application.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;

import com.dajiangtang.application.dto.ApplicationResponse;

@Repository
@ConditionalOnProperty(name = "app.persistence", havingValue = "memory", matchIfMissing = true)
public class InMemoryApplicationRepository implements ApplicationRepository {

    private final AtomicLong ids = new AtomicLong(1);
    private final List<ApplicationResponse> applications = new ArrayList<>();

    @Override
    public synchronized ApplicationResponse create(String recruitmentId, String username, String applicantName, String phone, String note) {
        ApplicationResponse response = new ApplicationResponse(ids.getAndIncrement(), recruitmentId, applicantName, phone, "已提交", "申请已提交，平台联系人会尽快跟进。");
        applications.add(response);
        return response;
    }

    @Override
    public synchronized long countAll() {
        return applications.size();
    }
}
