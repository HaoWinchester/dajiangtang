package com.dajiangtang.recruitment;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import com.dajiangtang.security.CurrentUserRoleResolver;

@SpringBootTest
@AutoConfigureMockMvc
class RecruitmentSearchPaginationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void searchesPositionByKeyword() throws Exception {
        mockMvc.perform(get("/api/recruitments")
                        .param("positionKeyword", "Java")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(2))
                .andExpect(jsonPath("$.items[0].id").value("rec-013"))
                .andExpect(jsonPath("$.items[1].id").value("rec-002"));
    }

    @Test
    void searchesPositionCaseInsensitively() throws Exception {
        mockMvc.perform(get("/api/recruitments")
                        .param("positionKeyword", "java")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(2))
                .andExpect(jsonPath("$.items[0].id").value("rec-013"))
                .andExpect(jsonPath("$.items[1].id").value("rec-002"));
    }

    @Test
    void trimsPositionKeywordBeforeSearching() throws Exception {
        mockMvc.perform(get("/api/recruitments")
                        .param("positionKeyword", "  产品  ")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(1))
                .andExpect(jsonPath("$.items[0].id").value("rec-005"));
    }

    @Test
    void searchesCityByStandardCityName() throws Exception {
        mockMvc.perform(get("/api/recruitments")
                        .param("city", "北京市")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(3))
                .andExpect(jsonPath("$.items[0].id").value("rec-013"))
                .andExpect(jsonPath("$.items[1].id").value("rec-001"))
                .andExpect(jsonPath("$.items[2].id").value("rec-005"));
    }

    @Test
    void trimsStandardCityNameBeforeSearching() throws Exception {
        mockMvc.perform(get("/api/recruitments")
                        .param("city", "  深圳市  ")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(2))
                .andExpect(jsonPath("$.items[0].id").value("rec-003"))
                .andExpect(jsonPath("$.items[1].id").value("rec-012"));
    }

    @Test
    void searchesCityByPartialName() throws Exception {
        mockMvc.perform(get("/api/recruitments")
                        .param("city", "北京")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(3))
                .andExpect(jsonPath("$.items[0].id").value("rec-013"))
                .andExpect(jsonPath("$.items[1].id").value("rec-001"))
                .andExpect(jsonPath("$.items[2].id").value("rec-005"));
    }

    @Test
    void searchesCityByInnerKeyword() throws Exception {
        mockMvc.perform(get("/api/recruitments")
                        .param("city", "圳")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(2))
                .andExpect(jsonPath("$.items[0].id").value("rec-003"))
                .andExpect(jsonPath("$.items[1].id").value("rec-012"));
    }

    @Test
    void combinesPositionAndCityFilters() throws Exception {
        mockMvc.perform(get("/api/recruitments")
                        .param("positionKeyword", "Java")
                        .param("city", "上海市")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(1))
                .andExpect(jsonPath("$.items[0].id").value("rec-002"))
                .andExpect(jsonPath("$.items[0].city").value("上海市"));
    }

    @Test
    void combinedFiltersReturnEmptyWhenOnlyOneConditionMatches() throws Exception {
        mockMvc.perform(get("/api/recruitments")
                        .param("positionKeyword", "Java")
                        .param("city", "深圳市")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(0))
                .andExpect(jsonPath("$.items.length()").value(0));
    }

    @Test
    void blankSearchConditionsRestoreDefaultList() throws Exception {
        mockMvc.perform(get("/api/recruitments")
                        .param("positionKeyword", "   ")
                        .param("city", "   ")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.pageSize").value(10))
                .andExpect(jsonPath("$.totalItems").value(13))
                .andExpect(jsonPath("$.items.length()").value(10));
    }

    @Test
    void paginatesWithFixedPageSizeAndIgnoresRequestedPageSize() throws Exception {
        mockMvc.perform(get("/api/recruitments")
                        .param("page", "2")
                        .param("pageSize", "5")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(2))
                .andExpect(jsonPath("$.pageSize").value(10))
                .andExpect(jsonPath("$.totalItems").value(13))
                .andExpect(jsonPath("$.totalPages").value(2))
                .andExpect(jsonPath("$.items.length()").value(3))
                .andExpect(jsonPath("$.items[0].id").value("rec-010"));
    }

    @Test
    void invalidPageNumberFallsBackToFirstPage() throws Exception {
        mockMvc.perform(get("/api/recruitments")
                        .param("page", "0")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.items[0].id").value("rec-013"));
    }

    @Test
    void outOfRangePageReturnsEmptyItemsWithStableMetadata() throws Exception {
        mockMvc.perform(get("/api/recruitments")
                        .param("page", "99")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(99))
                .andExpect(jsonPath("$.pageSize").value(10))
                .andExpect(jsonPath("$.totalItems").value(13))
                .andExpect(jsonPath("$.totalPages").value(2))
                .andExpect(jsonPath("$.items.length()").value(0));
    }

    @Test
    void unmatchedCityKeywordReturnsEmptyResult() throws Exception {
        mockMvc.perform(get("/api/recruitments")
                        .param("city", "不存在城市")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(0))
                .andExpect(jsonPath("$.totalPages").value(0))
                .andExpect(jsonPath("$.items.length()").value(0));
    }
}
