package com.dajiangtang.talent.service;

import org.springframework.stereotype.Service;

import com.dajiangtang.common.error.BadRequestException;
import com.dajiangtang.talent.dto.TalentDetailResponse;
import com.dajiangtang.talent.dto.TalentListQuery;
import com.dajiangtang.talent.dto.TalentListResponse;
import com.dajiangtang.talent.repository.TalentRepository;

@Service
public class TalentService {

    private final TalentRepository talentRepository;

    public TalentService(TalentRepository talentRepository) {
        this.talentRepository = talentRepository;
    }

    public TalentListResponse list(TalentListQuery query) {
        long total = talentRepository.count(query);
        int totalPages = total == 0 ? 0 : (int) Math.ceil((double) total / query.pageSize());
        return new TalentListResponse(
                talentRepository.findAll(query),
                query.page(),
                query.pageSize(),
                total,
                totalPages
        );
    }

    public TalentDetailResponse detail(long id) {
        return talentRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("人才信息不存在。"));
    }

    public long countAll() {
        return talentRepository.countAll();
    }
}
