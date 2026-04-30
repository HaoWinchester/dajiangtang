package com.dajiangtang.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "用户名不能为空。")
        @Size(min = 3, max = 32, message = "用户名长度需为 3-32 个字符。")
        String username,
        @NotBlank(message = "密码不能为空。")
        @Size(min = 6, max = 64, message = "密码长度需为 6-64 个字符。")
        String password,
        @NotBlank(message = "确认密码不能为空。")
        String confirmPassword,
        @NotBlank(message = "手机号不能为空。")
        @Pattern(regexp = "^1\\d{10}$", message = "手机号格式不正确。")
        String phone,
        @NotBlank(message = "短信验证码不能为空。")
        String smsCode,
        @NotBlank(message = "账号类型不能为空。")
        String role
) {
}
