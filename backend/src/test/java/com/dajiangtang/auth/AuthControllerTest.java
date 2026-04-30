package com.dajiangtang.auth;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.dajiangtang.security.CurrentUserRoleResolver;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void registersNormalUserAndSetsRoleCookie() throws Exception {
        String username = "normal_" + System.nanoTime();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "%s",
                                  "password": "Cspm@2026",
                                  "confirmPassword": "Cspm@2026",
                                  "phone": "13800001001",
                                  "smsCode": "123456",
                                  "role": "USER"
                                }
                                """.formatted(username)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(username))
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(cookie().value(CurrentUserRoleResolver.ROLE_COOKIE, "USER"))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("SameSite=Lax")));
    }

    @Test
    void registersCompanyUserAndSetsCompanyRoleCookie() throws Exception {
        String username = "company_" + System.nanoTime();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "%s",
                                  "password": "Cspm@2026",
                                  "confirmPassword": "Cspm@2026",
                                  "phone": "13800001002",
                                  "smsCode": "123456",
                                  "role": "COMPANY"
                                }
                                """.formatted(username)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(username))
                .andExpect(jsonPath("$.role").value("COMPANY"))
                .andExpect(cookie().value(CurrentUserRoleResolver.ROLE_COOKIE, "COMPANY"));
    }

    @Test
    void loginUsesBackendRegisteredAccount() throws Exception {
        String username = "login_" + System.nanoTime();
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "%s",
                                  "password": "Cspm@2026",
                                  "confirmPassword": "Cspm@2026",
                                  "phone": "13800001003",
                                  "smsCode": "123456",
                                  "role": "USER"
                                }
                                """.formatted(username)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "%s",
                                  "password": "Cspm@2026"
                                }
                                """.formatted(username)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(cookie().value(CurrentUserRoleResolver.ROLE_COOKIE, "USER"));
    }

    @Test
    void seededDemoAccountsCanLogin() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "cspm_company",
                                  "password": "Cspm@2026"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("COMPANY"))
                .andExpect(cookie().value(CurrentUserRoleResolver.ROLE_COOKIE, "COMPANY"));
    }

    @Test
    void duplicateUsernameReturns409() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "cspm_user",
                                  "password": "Cspm@2026",
                                  "confirmPassword": "Cspm@2026",
                                  "phone": "13800001004",
                                  "smsCode": "123456",
                                  "role": "USER"
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("用户名已存在。"));
    }

    @Test
    void passwordConfirmationMustMatch() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "bad_confirm",
                                  "password": "Cspm@2026",
                                  "confirmPassword": "Other@2026",
                                  "phone": "13800001005",
                                  "smsCode": "123456",
                                  "role": "USER"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("两次输入的密码不一致。"));
    }

    @Test
    void wrongPasswordReturns401() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "cspm_user",
                                  "password": "Wrong@2026"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("用户名或密码错误。"));
    }
}
