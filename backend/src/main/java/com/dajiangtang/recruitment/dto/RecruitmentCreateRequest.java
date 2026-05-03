package com.dajiangtang.recruitment.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RecruitmentCreateRequest(
        @NotBlank(message = "请填写岗位名称。")
        @Size(max = 128, message = "岗位名称不能超过128个字符。")
        String position,

        @NotBlank(message = "请填写公司。")
        @Size(max = 160, message = "公司不能超过160个字符。")
        String companyName,

        @Size(max = 128, message = "部门不能超过128个字符。")
        String department,

        @Size(max = 128, message = "招聘岗位不能超过128个字符。")
        String recruitmentPost,

        @Size(max = 255, message = "岗位标签不能超过255个字符。")
        String jobTags,

        @NotNull(message = "请填写需求人数。")
        @Min(value = 1, message = "需求人数至少为1人。")
        Integer headcount,

        @NotBlank(message = "请填写工作地点。")
        @Size(max = 64, message = "城市不能超过64个字符。")
        String city,

        @Size(max = 255, message = "详细工作地点不能超过255个字符。")
        String workLocation,

        @NotBlank(message = "请填写薪资。")
        @Size(max = 64, message = "薪资不能超过64个字符。")
        String salary,

        LocalDate requiredArrivalDate,

        @NotBlank(message = "请选择招聘进度。")
        @Size(max = 64, message = "招聘进度不能超过64个字符。")
        String recruitmentProgress,

        @NotBlank(message = "请填写负责人。")
        @Size(max = 64, message = "负责人不能超过64个字符。")
        String owner,

        @NotBlank(message = "请填写联系电话。")
        @Size(max = 32, message = "联系电话不能超过32个字符。")
        String contactPhone,

        @NotBlank(message = "请填写岗位说明。")
        String jobDescription,

        @NotBlank(message = "请填写岗位要求。")
        String jobRequirement,

        @NotBlank(message = "请填写技能要求。")
        String skillRequirement,

        String welfare,
        String follower,
        String level,
        String remark,
        Boolean cspmPreferred
) {
}
