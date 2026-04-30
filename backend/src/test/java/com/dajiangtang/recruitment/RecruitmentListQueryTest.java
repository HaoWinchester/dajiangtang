package com.dajiangtang.recruitment;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
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
class RecruitmentListQueryTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void listsDefaultRecruitmentsWithRequiredFieldsAndPagination() throws Exception {
        mockMvc.perform(get("/api/recruitments")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.pageSize").value(10))
                .andExpect(jsonPath("$.totalItems").value(13))
                .andExpect(jsonPath("$.totalPages").value(2))
                .andExpect(jsonPath("$.items.length()").value(10))
                .andExpect(jsonPath("$.items[0].id").value("rec-013"))
                .andExpect(jsonPath("$.items[0].position").value("Java 架构师"))
                .andExpect(jsonPath("$.items[0].salary").value("35k-55k"))
                .andExpect(jsonPath("$.items[0].companyName").value("北京平台科技有限公司"))
                .andExpect(jsonPath("$.items[0].city").value("北京市"))
                .andExpect(jsonPath("$.items[0].owner").value("马骁"))
                .andExpect(jsonPath("$.items[0].headcount").value(1))
                .andExpect(jsonPath("$.items[0].status").doesNotExist());
    }

    @Test
    void listItemContainsOnlyTheSevenContractedFields() throws Exception {
        mockMvc.perform(get("/api/recruitments")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].*", hasSize(7)));
    }

    @Test
    void listResponseContainsOnlyPaginationItemsAndPermissionFields() throws Exception {
        mockMvc.perform(get("/api/recruitments")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.*", hasSize(6)))
                .andExpect(jsonPath("$.items").exists())
                .andExpect(jsonPath("$.page").exists())
                .andExpect(jsonPath("$.pageSize").exists())
                .andExpect(jsonPath("$.totalItems").exists())
                .andExpect(jsonPath("$.totalPages").exists())
                .andExpect(jsonPath("$.canCreate").exists());
    }

    @Test
    void sortsDefaultRecruitmentsByLatestActivityDescending() throws Exception {
        mockMvc.perform(get("/api/recruitments")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].id").value("rec-013"))
                .andExpect(jsonPath("$.items[1].id").value("rec-008"))
                .andExpect(jsonPath("$.items[2].id").value("rec-004"))
                .andExpect(jsonPath("$.items[3].id").value("rec-002"))
                .andExpect(jsonPath("$.items[4].id").value("rec-001"))
                .andExpect(jsonPath("$.items[9].id").value("rec-009"));
    }

    @Test
    void excludesClosedRecruitmentsFromDefaultListAndSearchResults() throws Exception {
        mockMvc.perform(get("/api/recruitments")
                        .param("positionKeyword", "CSPM")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(0))
                .andExpect(content().string(not(containsString("rec-014"))));
    }

    @Test
    void excludesPausedRecruitmentsFromDefaultListAndSearchResults() throws Exception {
        mockMvc.perform(get("/api/recruitments")
                        .param("positionKeyword", "招聘")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(0))
                .andExpect(content().string(not(containsString("rec-015"))));
    }

    @Test
    void doesNotLeakContactOrDetailOnlyFieldsInListResponse() throws Exception {
        mockMvc.perform(get("/api/recruitments")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER"))
                .andExpect(status().isOk())
                .andExpect(content().string(not(containsString("contactPhone"))))
                .andExpect(content().string(not(containsString("13800000000"))))
                .andExpect(content().string(not(containsString("CSPM 顾问"))))
                .andExpect(content().string(not(containsString("岗位说明"))))
                .andExpect(content().string(not(containsString("岗位要求"))))
                .andExpect(content().string(not(containsString("福利待遇"))));
    }
}
