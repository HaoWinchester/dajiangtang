package com.dajiangtang.talent.dto;

import java.util.List;

import com.dajiangtang.common.dto.PageResponse;

public class TalentListResponse extends PageResponse<TalentListItemResponse> {

    public TalentListResponse(List<TalentListItemResponse> items, int page, int pageSize, long totalItems, int totalPages) {
        super(items, page, pageSize, totalItems, totalPages);
    }
}
