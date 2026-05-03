package com.dajiangtang.talent.service;

import java.util.Map;

import org.springframework.stereotype.Service;

import com.dajiangtang.talent.repository.TalentRepository;

@Service
public class TalentSyncService {

    private final TalentRepository talentRepository;

    public TalentSyncService(TalentRepository talentRepository) {
        this.talentRepository = talentRepository;
    }

    public void syncProfile(String username, Map<String, String> fields) {
        talentRepository.upsertFromProfile(username, fields);
    }

    public void syncRegisteredUser(String username, String phone) {
        talentRepository.upsertFromProfile(username, Map.of(
                "name", username,
                "phone", phone == null ? "" : phone,
                "jobIntention", "待完善",
                "city", "待完善",
                "industry", "待完善",
                "personalAdvantage", "新注册用户，待完善个人资料。"
        ));
    }
}
