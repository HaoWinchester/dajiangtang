package com.dajiangtang.recruitment.dto;

public record RecruitmentListQuery(
        String positionKeyword,
        String city,
        int page,
        int pageSize
) {

    private static final int DEFAULT_PAGE = 1;
    private static final int DEFAULT_PAGE_SIZE = 10;

    public static RecruitmentListQuery of(String positionKeyword, String city, Integer page, Integer pageSize) {
        return new RecruitmentListQuery(
                trimToNull(positionKeyword),
                trimToNull(city),
                page == null || page < 1 ? DEFAULT_PAGE : page,
                DEFAULT_PAGE_SIZE
        );
    }

    public boolean hasPositionKeyword() {
        return positionKeyword != null;
    }

    public boolean hasCity() {
        return city != null;
    }

    private static String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
