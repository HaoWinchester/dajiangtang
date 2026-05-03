package com.dajiangtang.home;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class HomeRecruitmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void publicHomeRecruitmentsComeFromRecruitmentRepository() throws Exception {
        mockMvc.perform(get("/api/home/recruitments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(5))
                .andExpect(jsonPath("$[0].id").value("rec-013"))
                .andExpect(jsonPath("$[0].position").value("Java 架构师"))
                .andExpect(jsonPath("$[0].salary").value("35k-55k"))
                .andExpect(jsonPath("$[0].companyName").value("北京平台科技有限公司"))
                .andExpect(jsonPath("$[0].city").value("北京市"))
                .andExpect(jsonPath("$[0].owner").value("马骁"))
                .andExpect(jsonPath("$[0].headcount").value(1))
                .andExpect(jsonPath("$[0].cspmPreferred").value(true));
    }

    @Test
    void publicHomeRecruitmentsExcludePausedAndClosedRows() throws Exception {
        mockMvc.perform(get("/api/home/recruitments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == 'rec-014')]").isEmpty())
                .andExpect(jsonPath("$[?(@.id == 'rec-015')]").isEmpty());
    }
}
