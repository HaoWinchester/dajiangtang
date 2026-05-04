package com.dajiangtang.talent.service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;

import com.dajiangtang.talent.repository.TalentRepository;

@Service
public class TalentSyncService {

    private static final String CSPM_CERTIFIED_FIELD = "\u662f\u5426\u5177\u5907CSPM\u8ba4\u8bc1";
    private static final String OTHER_CERTIFICATES_FIELD = "\u5176\u4ed6\u8d44\u683c\u8bc1\u4e66";
    private static final Pattern CERTIFICATE_SEPARATOR = Pattern.compile("[,，;；/、\\n\\r]+");

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

    public void syncCertificates(String username, List<Map<String, String>> records) {
        talentRepository.replaceCertificates(username, certificatesFrom(records));
    }

    private List<String> certificatesFrom(List<Map<String, String>> records) {
        Set<String> certificates = new LinkedHashSet<>();
        for (Map<String, String> record : records == null ? List.<Map<String, String>>of() : records) {
            addCspmCertificate(certificates, value(record, CSPM_CERTIFIED_FIELD));
            addOtherCertificates(certificates, value(record, OTHER_CERTIFICATES_FIELD));
        }
        return new ArrayList<>(certificates);
    }

    private void addCspmCertificate(Set<String> certificates, String value) {
        if (value.isBlank() || isNegative(value)) {
            return;
        }
        certificates.add(value.toUpperCase().contains("CSPM") ? value : "CSPM");
    }

    private void addOtherCertificates(Set<String> certificates, String value) {
        if (value.isBlank()) {
            return;
        }
        for (String certificate : CERTIFICATE_SEPARATOR.split(value)) {
            String trimmed = certificate.trim();
            if (!trimmed.isBlank()) {
                certificates.add(trimmed);
            }
        }
    }

    private boolean isNegative(String value) {
        String normalized = value.trim().toLowerCase();
        return normalized.equals("\u5426")
                || normalized.equals("\u65e0")
                || normalized.equals("no")
                || normalized.equals("false")
                || normalized.equals("0");
    }

    private String value(Map<String, String> record, String key) {
        if (record == null) {
            return "";
        }
        String value = record.get(key);
        return value == null ? "" : value.trim();
    }
}
