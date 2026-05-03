package com.dajiangtang.recruitment;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.dajiangtang.security.CurrentUserRoleResolver;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class RecruitmentCreateWorkflowTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void adminCreatesRecruitmentAndCanReadItFromListAndDetail() throws Exception {
        MvcResult createResult = mockMvc.perform(post("/api/recruitments")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "ADMIN")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validPayload("CSPM 测试项目经理", "北京市")))
                .andExpect(status().isCreated())
                .andExpect(header().string("Content-Type", org.hamcrest.Matchers.containsString(MediaType.APPLICATION_JSON_VALUE)))
                .andExpect(jsonPath("$.message").value("招聘信息已新增。"))
                .andExpect(jsonPath("$.recruitment.position").value("CSPM 测试项目经理"))
                .andExpect(jsonPath("$.recruitment.companyName").value("北京闭环科技有限公司"))
                .andExpect(jsonPath("$.recruitment.jobDescription").value("负责项目管理人才库平台交付。"))
                .andReturn();

        String id = com.jayway.jsonpath.JsonPath.read(createResult.getResponse().getContentAsString(), "$.id");

        mockMvc.perform(get("/api/recruitments")
                        .param("positionKeyword", "CSPM 测试")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(1))
                .andExpect(jsonPath("$.items[0].id").value(id))
                .andExpect(jsonPath("$.items[0].position").value("CSPM 测试项目经理"));

        mockMvc.perform(get("/api/recruitments/{id}", id)
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.position").value("CSPM 测试项目经理"))
                .andExpect(jsonPath("$.city").value("北京市"))
                .andExpect(jsonPath("$.headcount").value(2))
                .andExpect(jsonPath("$.cspmPreferred").value(true));
    }

    @Test
    void normalUserCannotCreateRecruitment() throws Exception {
        mockMvc.perform(post("/api/recruitments")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "USER")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validPayload("普通用户越权岗位", "上海市")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("只有管理员可以新增招聘信息。"));
    }

    @Test
    void unauthenticatedUserCannotCreateRecruitment() throws Exception {
        mockMvc.perform(post("/api/recruitments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validPayload("未登录岗位", "上海市")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("未登录或登录态失效。"));
    }

    @Test
    void createRecruitmentRejectsMissingRequiredFields() throws Exception {
        mockMvc.perform(post("/api/recruitments")
                        .header(CurrentUserRoleResolver.ROLE_HEADER, "ADMIN")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "position": "",
                                  "companyName": "北京闭环科技有限公司",
                                  "headcount": 0,
                                  "city": "",
                                  "salary": "",
                                  "recruitmentProgress": "",
                                  "owner": "",
                                  "contactPhone": "",
                                  "jobDescription": "",
                                  "jobRequirement": "",
                                  "skillRequirement": ""
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    private String validPayload(String position, String city) {
        return """
                {
                  "position": "%s",
                  "companyName": "北京闭环科技有限公司",
                  "department": "项目交付部",
                  "recruitmentPost": "项目经理",
                  "jobTags": "CSPM优先,重点岗位",
                  "headcount": 2,
                  "city": "%s",
                  "workLocation": "%s海淀区",
                  "salary": "20k-35k",
                  "requiredArrivalDate": "2026-06-30",
                  "recruitmentProgress": "紧急启动",
                  "owner": "赵义民",
                  "contactPhone": "13800000000",
                  "jobDescription": "负责项目管理人才库平台交付。",
                  "jobRequirement": "具备项目管理经验和跨部门沟通能力。",
                  "skillRequirement": "项目计划,风险管理,客户沟通",
                  "welfare": "五险一金、餐补、带薪年假",
                  "follower": "贺强",
                  "level": "P4",
                  "remark": "管理员新增闭环测试",
                  "cspmPreferred": true
                }
                """.formatted(position, city, city);
    }
}
