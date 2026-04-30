package com.dajiangtang.recruitment.dto;

import java.util.List;

import com.dajiangtang.common.dto.PageResponse;

public class RecruitmentListResponse extends PageResponse<RecruitmentListItemResponse> {

    private final boolean canCreate;

    public RecruitmentListResponse(
            List<RecruitmentListItemResponse> items,
            int page,
            int pageSize,
            long totalItems,
            int totalPages,
            boolean canCreate
    ) {
        super(items, page, pageSize, totalItems, totalPages);
        this.canCreate = canCreate;
    }

    public boolean isCanCreate() {
        return canCreate;
    }
}
