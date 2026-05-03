package com.dajiangtang.company.repository;

import java.util.Map;

public interface CompanyProfileRepository {

    Map<String, Object> findCompanyFields(String username);

    Map<String, Object> saveCompanyFields(String username, Map<String, Object> fields);
}
