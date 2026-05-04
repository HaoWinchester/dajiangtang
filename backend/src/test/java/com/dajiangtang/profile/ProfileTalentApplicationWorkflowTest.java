package com.dajiangtang.profile;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.dajiangtang.security.CurrentUserRoleResolver;

@SpringBootTest
@AutoConfigureMockMvc
class ProfileTalentApplicationWorkflowTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void personalProfileIsSavedByUsernameAndSyncedToTalentList() throws Exception {
        saveProfile("profile_a", "甲用户", "北京");
        saveProfile("profile_b", "乙用户", "上海");

        mockMvc.perform(get("/api/me/profile")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER")
                        .header(CurrentUserRoleResolver.USERNAME_HEADER, "profile_a"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fields.name").value("甲用户"))
                .andExpect(jsonPath("$.fields.city").value("北京"));

        mockMvc.perform(get("/api/me/profile")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER")
                        .header(CurrentUserRoleResolver.USERNAME_HEADER, "profile_b"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fields.name").value("乙用户"))
                .andExpect(jsonPath("$.fields.city").value("上海"));

        mockMvc.perform(get("/api/talents")
                        .param("name", "甲")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(1))
                .andExpect(jsonPath("$.items[0].maskedName").value("甲*户"));
    }

    @Test
    void moduleRecordCanBeCreatedEditedAndDeleted() throws Exception {
        MvcResult created = mockMvc.perform(post("/api/me/profile/modules/project-experience")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER")
                        .header(CurrentUserRoleResolver.USERNAME_HEADER, "module_user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fields": {
                                    "起止时间": "2025.01 - 2025.12",
                                    "项目内容": "原始项目"
                                  }
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fields.项目内容").value("原始项目"))
                .andReturn();

        String id = com.jayway.jsonpath.JsonPath.read(created.getResponse().getContentAsString(), "$.id").toString();

        mockMvc.perform(put("/api/me/profile/modules/project-experience/{id}", id)
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER")
                        .header(CurrentUserRoleResolver.USERNAME_HEADER, "module_user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fields": {
                                    "起止时间": "2025.01 - 2025.12",
                                    "项目内容": "编辑后项目"
                                  }
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fields.项目内容").value("编辑后项目"));

        mockMvc.perform(delete("/api/me/profile/modules/project-experience/{id}", id)
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER")
                        .header(CurrentUserRoleResolver.USERNAME_HEADER, "module_user"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/me/profile/modules/project-experience")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER")
                        .header(CurrentUserRoleResolver.USERNAME_HEADER, "module_user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void recruitmentApplicationIsPersistedIntoAnalytics() throws Exception {
        mockMvc.perform(post("/api/recruitments/rec-001/applications")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER")
                        .header(CurrentUserRoleResolver.USERNAME_HEADER, "apply_user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "applicantName": "申请用户",
                                  "phone": "13812345678",
                                  "note": "申请说明"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("已提交"));

        mockMvc.perform(get("/api/analytics")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.applicationCount").value(1));
    }

    @Test
    void recruitmentDetailIsPublicForApplicationPreview() throws Exception {
        mockMvc.perform(get("/api/recruitments/rec-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("rec-001"))
                .andExpect(jsonPath("$.position").value("项目经理"));
    }

    @Test
    void registeredPersonalUserAppearsInTalentListBeforeProfileCompletion() throws Exception {
        String username = "registered_" + System.nanoTime();
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "%s",
                                  "password": "Cspm@2026",
                                  "confirmPassword": "Cspm@2026",
                                  "phone": "13812345678",
                                  "smsCode": "123456",
                                  "role": "USER"
                                }
                                """.formatted(username)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/talents")
                        .param("name", username)
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(1))
                .andExpect(jsonPath("$.items[0].jobIntention").value("待完善"));
    }

    @Test
    void certificateModuleRecordsAreSyncedToTalentList() throws Exception {
        String username = "cert_user_" + System.nanoTime();
        saveProfile(username, username, "Shanghai");

        mockMvc.perform(post("/api/me/profile/modules/certificates")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER")
                        .header(CurrentUserRoleResolver.USERNAME_HEADER, username)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fields": {
                                    "\u662f\u5426\u5177\u5907CSPM\u8ba4\u8bc1": "\u662f",
                                    "\u5176\u4ed6\u8d44\u683c\u8bc1\u4e66": "PMP\uff0c\u8f6f\u8003\u9ad8\u7ea7"
                                  }
                                }
                                """))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/talents")
                        .param("name", username)
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(1))
                .andExpect(jsonPath("$.items[0].certificates[0]").value("CSPM"))
                .andExpect(jsonPath("$.items[0].certificates[1]").value("PMP"))
                .andExpect(jsonPath("$.items[0].certificates[2]").value("\u8f6f\u8003\u9ad8\u7ea7"));
    }

    private void saveProfile(String username, String name, String city) throws Exception {
        mockMvc.perform(put("/api/me/profile")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER")
                        .header(CurrentUserRoleResolver.USERNAME_HEADER, username)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fields": {
                                    "name": "%s",
                                    "jobIntention": "项目经理",
                                    "city": "%s",
                                    "industry": "互联网",
                                    "phone": "13811112222",
                                    "email": "%s@example.com",
                                    "personalAdvantage": "个人优势"
                                  }
                                }
                                """.formatted(name, city, username)))
                .andExpect(status().isOk());
    }
}
