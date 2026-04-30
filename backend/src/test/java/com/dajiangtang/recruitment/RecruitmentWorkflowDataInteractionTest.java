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
class RecruitmentWorkflowDataInteractionTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void adminAndRegularUserReceiveTheSameDefaultRecruitmentData() throws Exception {
        mockMvc.perform(get("/api/recruitments")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].id").value("rec-013"))
                .andExpect(jsonPath("$.totalItems").value(13));

        mockMvc.perform(get("/api/recruitments")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].id").value("rec-013"))
                .andExpect(jsonPath("$.totalItems").value(13));
    }

    @Test
    void adminAndCompanyUserReceiveTheSameDefaultRecruitmentData() throws Exception {
        mockMvc.perform(get("/api/recruitments")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[1].id").value("rec-008"))
                .andExpect(jsonPath("$.totalPages").value(2));

        mockMvc.perform(get("/api/recruitments")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "COMPANY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[1].id").value("rec-008"))
                .andExpect(jsonPath("$.totalPages").value(2));
    }

    @Test
    void roleOnlyChangesCreatePermissionNotSearchResults() throws Exception {
        mockMvc.perform(get("/api/recruitments")
                        .param("positionKeyword", "Java")
                        .param("city", "上海市")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.canCreate").value(true))
                .andExpect(jsonPath("$.totalItems").value(1))
                .andExpect(jsonPath("$.items[0].id").value("rec-002"));

        mockMvc.perform(get("/api/recruitments")
                        .param("positionKeyword", "Java")
                        .param("city", "上海市")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.canCreate").value(false))
                .andExpect(jsonPath("$.totalItems").value(1))
                .andExpect(jsonPath("$.items[0].id").value("rec-002"));
    }

    @Test
    void searchResultKeepsAdminCreatePermission() throws Exception {
        mockMvc.perform(get("/api/recruitments")
                        .param("city", "北京市")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.canCreate").value(true))
                .andExpect(jsonPath("$.totalItems").value(3));
    }

    @Test
    void searchResultKeepsRegularUserReadOnlyPermission() throws Exception {
        mockMvc.perform(get("/api/recruitments")
                        .param("city", "北京市")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.canCreate").value(false))
                .andExpect(jsonPath("$.totalItems").value(3));
    }

    @Test
    void paginationKeepsAdminCreatePermission() throws Exception {
        mockMvc.perform(get("/api/recruitments")
                        .param("page", "2")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.canCreate").value(true))
                .andExpect(jsonPath("$.page").value(2));
    }

    @Test
    void paginationKeepsCompanyUserReadOnlyPermission() throws Exception {
        mockMvc.perform(get("/api/recruitments")
                        .param("page", "2")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "COMPANY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.canCreate").value(false))
                .andExpect(jsonPath("$.page").value(2));
    }
}
