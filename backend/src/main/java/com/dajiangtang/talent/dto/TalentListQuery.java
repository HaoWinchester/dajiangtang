package com.dajiangtang.talent.dto;

public record TalentListQuery(
        String name,
        String company,
        String industry,
        String city,
        int page,
        int pageSize
) {

    public static TalentListQuery of(String name, String company, String industry, String city, Integer page, Integer pageSize) {
        int resolvedPageSize = pageSize == null ? 2 : Math.min(Math.max(pageSize, 1), 50);
        int resolvedPage = page == null ? 1 : Math.max(page, 1);
        return new TalentListQuery(
                trim(name),
                trim(company),
                trim(industry),
                trim(city),
                resolvedPage,
                resolvedPageSize
        );
    }

    private static String trim(String value) {
        return value == null ? "" : value.trim();
    }
}
