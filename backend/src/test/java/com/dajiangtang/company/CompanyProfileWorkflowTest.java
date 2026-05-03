package com.dajiangtang.company;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.dajiangtang.security.CurrentUserRoleResolver;

@SpringBootTest
@AutoConfigureMockMvc
class CompanyProfileWorkflowTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void companyProfileIsSavedByCompanyUsername() throws Exception {
        mockMvc.perform(put("/api/me/company-profile")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "COMPANY")
                        .header(CurrentUserRoleResolver.USERNAME_HEADER, "company_a")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fields": {
                                    "公司名称 *": "甲企业",
                                    "公司类型": "民营企业",
                                    "所属行业": "互联网",
                                    "五险一金 (全额缴纳)": true
                                  }
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fields['公司名称 *']").value("甲企业"))
                .andExpect(jsonPath("$.fields['五险一金 (全额缴纳)']").value(true));

        mockMvc.perform(put("/api/me/company-profile")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "COMPANY")
                        .header(CurrentUserRoleResolver.USERNAME_HEADER, "company_b")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fields": {
                                    "公司名称 *": "乙企业"
                                  }
                                }
                                """))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/me/company-profile")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "COMPANY")
                        .header(CurrentUserRoleResolver.USERNAME_HEADER, "company_a"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fields['公司名称 *']").value("甲企业"));

        mockMvc.perform(get("/api/me/company-profile")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "COMPANY")
                        .header(CurrentUserRoleResolver.USERNAME_HEADER, "company_b"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fields['公司名称 *']").value("乙企业"));
    }

    @Test
    void normalUserCannotMaintainCompanyProfile() throws Exception {
        mockMvc.perform(get("/api/me/company-profile")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER")
                        .header(CurrentUserRoleResolver.USERNAME_HEADER, "user_a"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("仅企业用户可以维护企业资料。"));
    }
}
