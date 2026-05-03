package com.dajiangtang.application.repository;

import com.dajiangtang.application.dto.ApplicationResponse;

public interface ApplicationRepository {

    ApplicationResponse create(String recruitmentId, String username, String applicantName, String phone, String note);

    long countAll();
}
