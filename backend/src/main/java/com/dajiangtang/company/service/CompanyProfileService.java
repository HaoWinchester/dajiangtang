package com.dajiangtang.company.service;

import java.util.Map;

import org.springframework.stereotype.Service;

import com.dajiangtang.common.error.ForbiddenException;
import com.dajiangtang.company.dto.CompanyProfileResponse;
import com.dajiangtang.company.repository.CompanyProfileRepository;
import com.dajiangtang.user.domain.UserRole;

@Service
public class CompanyProfileService {

    private final CompanyProfileRepository companyProfileRepository;

    public CompanyProfileService(CompanyProfileRepository companyProfileRepository) {
        this.companyProfileRepository = companyProfileRepository;
    }

    public CompanyProfileResponse getProfile(String username, UserRole role) {
        ensureCompany(role);
        return new CompanyProfileResponse(username, companyProfileRepository.findCompanyFields(username));
    }

    public CompanyProfileResponse saveProfile(String username, UserRole role, Map<String, Object> fields) {
        ensureCompany(role);
        return new CompanyProfileResponse(username, companyProfileRepository.saveCompanyFields(username, fields));
    }

    private void ensureCompany(UserRole role) {
        if (role != UserRole.COMPANY) {
            throw new ForbiddenException("仅企业用户可以维护企业资料。");
        }
    }
}
