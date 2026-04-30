package com.dajiangtang.recruitment;

import static org.hamcrest.Matchers.containsString;
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
    void doesNotLeakContactOrDetailOnlyFieldsInListResponse() throws Exception {
        mockMvc.perform(get("/api/recruitments")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER"))
                .andExpect(status().isOk())
                .andExpect(content().string(not(containsString("contactPhone"))))
                .andExpect(content().string(not(containsString("13800000000"))))
                .andExpect(content().string(not(containsString("CSPM 顾问"))));
    }
}
