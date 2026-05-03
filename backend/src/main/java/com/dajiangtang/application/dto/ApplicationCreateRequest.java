package com.dajiangtang.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ApplicationCreateRequest(
        @NotBlank(message = "请填写申请人姓名。")
        String applicantName,
        @Pattern(regexp = "^1[3-9]\\d{9}$", message = "请填写有效的联系电话。")
        String phone,
        String note
) {
}
