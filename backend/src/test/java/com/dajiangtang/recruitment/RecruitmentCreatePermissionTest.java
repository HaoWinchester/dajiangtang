package com.dajiangtang.recruitment;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockCookie;
import org.springframework.test.web.servlet.MockMvc;

import com.dajiangtang.security.CurrentUserRoleResolver;

@SpringBootTest
@AutoConfigureMockMvc
class RecruitmentCreatePermissionTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void adminCanCreateRecruitment() throws Exception {
        mockMvc.perform(get("/api/recruitments")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.canCreate").value(true));
    }

    @Test
    void normalUserCannotCreateRecruitment() throws Exception {
        mockMvc.perform(get("/api/recruitments")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.canCreate").value(false));
    }

    @Test
    void companyUserCannotCreateRecruitment() throws Exception {
        mockMvc.perform(get("/api/recruitments")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "COMPANY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.canCreate").value(false));
    }

    @Test
    void canResolveRoleFromCookie() throws Exception {
        MockCookie roleCookie = new MockCookie(CurrentUserRoleResolver.ROLE_COOKIE, "ADMIN");

        mockMvc.perform(get("/api/recruitments").cookie(roleCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.canCreate").value(true));
    }

    @Test
    void unauthenticatedRequestReturns401() throws Exception {
        mockMvc.perform(get("/api/recruitments"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("未登录或登录态失效。"));
    }
}
