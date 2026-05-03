package com.dajiangtang.upload;

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
class UploadImageWorkflowTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void uploadedImageIsSavedByAccountPageAndTarget() throws Exception {
        mockMvc.perform(put("/api/me/uploads/avatar")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER")
                        .header(CurrentUserRoleResolver.USERNAME_HEADER, "upload_user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "pagePath": "/personal-center",
                                  "dataUrl": "data:image/png;base64,AAAA"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dataUrl").value("data:image/png;base64,AAAA"));

        mockMvc.perform(get("/api/me/uploads/avatar")
                        .param("pagePath", "/personal-center")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER")
                        .header(CurrentUserRoleResolver.USERNAME_HEADER, "upload_user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dataUrl").value("data:image/png;base64,AAAA"));
    }

    @Test
    void invalidUploadDataIsRejected() throws Exception {
        mockMvc.perform(put("/api/me/uploads/avatar")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER")
                        .header(CurrentUserRoleResolver.USERNAME_HEADER, "upload_user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "pagePath": "/personal-center",
                                  "dataUrl": "not-image"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("仅支持保存图片数据。"));
    }
}
