package com.dajiangtang.talent.repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.dajiangtang.talent.dto.TalentDetailResponse;
import com.dajiangtang.talent.dto.TalentListItemResponse;
import com.dajiangtang.talent.dto.TalentListQuery;

public interface TalentRepository {

    List<TalentListItemResponse> findAll(TalentListQuery query);

    Optional<TalentDetailResponse> findById(long id);

    long count(TalentListQuery query);

    long countAll();

    void upsertFromProfile(String username, Map<String, String> fields);

    void replaceCertificates(String username, List<String> certificates);
}
