package com.dajiangtang.talent.repository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;

import com.dajiangtang.talent.dto.TalentDetailResponse;
import com.dajiangtang.talent.dto.TalentListItemResponse;
import com.dajiangtang.talent.dto.TalentListQuery;

@Repository
@ConditionalOnProperty(name = "app.persistence", havingValue = "memory", matchIfMissing = true)
public class InMemoryTalentRepository implements TalentRepository {

    private final AtomicLong ids = new AtomicLong(5);
    private final List<TalentDetailResponse> talents = new ArrayList<>(List.of(
            talent(1, "张*明", "张明", "男", "华东数字科技有限公司", "项目经理", "上海市", "互联网", "高级项目经理", "上海市", "具备跨部门项目治理、进度风险控制与团队协同经验。", "10 年项目管理经验，主导多个企业数字化转型项目。", "赵义民", List.of("CSPM-3")),
            talent(2, "李*华", "李华", "女", "中信咨询集团", "PMO 主管", "北京市", "金融", "PMO 负责人", "北京市", "熟悉大型集团项目集管理、预算控制和流程标准化。", "8 年金融行业 PMO 经验，持有 CSPM 相关证书。", "贺强", List.of("CSPM-4", "PMP")),
            talent(3, "王*雪", "王雪", "女", "深圳智造科技有限公司", "项目顾问", "深圳市", "互联网", "项目顾问", "深圳市", "擅长敏捷项目推进、需求拆解和干系人沟通。", "6 年项目交付经验，服务制造与互联网客户。", "蔡钰炜", List.of("PMP")),
            talent(4, "陈*刚", "陈刚", "男", "苏州精工智能制造有限公司", "项目经理", "上海市", "制造业", "制造业项目经理", "上海市", "熟悉智能制造项目现场交付、质量管理和供应商协同。", "12 年制造业项目管理经验，主导多地工厂改造项目。", "赵义民", List.of("CSPM-3"))
    ));
    private final Map<String, Long> profileTalentIds = new HashMap<>();

    @Override
    public synchronized List<TalentListItemResponse> findAll(TalentListQuery query) {
        List<TalentDetailResponse> matched = talents.stream()
                .filter(talent -> matches(talent, query))
                .sorted(Comparator.comparing(TalentDetailResponse::id))
                .toList();
        int start = Math.min((query.page() - 1) * query.pageSize(), matched.size());
        int end = Math.min(start + query.pageSize(), matched.size());
        return matched.subList(start, end).stream().map(this::toItem).toList();
    }

    @Override
    public synchronized Optional<TalentDetailResponse> findById(long id) {
        return talents.stream().filter(talent -> talent.id() == id).findFirst();
    }

    @Override
    public synchronized long count(TalentListQuery query) {
        return talents.stream().filter(talent -> matches(talent, query)).count();
    }

    @Override
    public synchronized long countAll() {
        return talents.size();
    }

    @Override
    public synchronized void upsertFromProfile(String username, Map<String, String> fields) {
        String name = fields.getOrDefault("name", "").trim();
        if (name.isBlank()) {
            return;
        }
        long id = profileTalentIds.computeIfAbsent(username, ignored -> ids.getAndIncrement());
        talents.removeIf(talent -> talent.id() == id);
        talents.add(new TalentDetailResponse(
                id,
                mask(name),
                name,
                fields.getOrDefault("gender", ""),
                fields.getOrDefault("company", "个人注册用户"),
                fields.getOrDefault("jobIntention", ""),
                fields.getOrDefault("city", ""),
                fields.getOrDefault("industry", ""),
                fields.getOrDefault("jobIntention", ""),
                fields.getOrDefault("city", ""),
                fields.getOrDefault("personalAdvantage", ""),
                fields.getOrDefault("personalAdvantage", ""),
                "赵义民",
                List.of(),
                List.of("赵义民", "贺强", "蔡钰炜")
        ));
    }

    private TalentListItemResponse toItem(TalentDetailResponse talent) {
        return new TalentListItemResponse(talent.id(), talent.maskedName(), talent.gender(), talent.jobIntention(), talent.expectedCity(), talent.currentCompany(), talent.industry(), talent.certificates());
    }

    private boolean matches(TalentDetailResponse talent, TalentListQuery query) {
        if (query.name().isBlank() && query.company().isBlank() && query.industry().isBlank() && query.city().isBlank()
                && "待完善".equals(talent.jobIntention())) {
            return false;
        }
        return contains(talent.maskedName() + talent.name(), query.name())
                && contains(talent.currentCompany(), query.company())
                && contains(talent.industry(), query.industry())
                && contains(talent.expectedCity() + talent.currentCity(), query.city());
    }

    private boolean contains(String value, String keyword) {
        return keyword == null || keyword.isBlank() || value.toLowerCase(Locale.ROOT).contains(keyword.toLowerCase(Locale.ROOT));
    }

    private static TalentDetailResponse talent(long id, String masked, String name, String gender, String company, String position, String city, String industry, String intention, String expectedCity, String advantage, String profile, String owner, List<String> certificates) {
        return new TalentDetailResponse(id, masked, name, gender, company, position, city, industry, intention, expectedCity, advantage, profile, owner, certificates, List.of("赵义民", "贺强", "蔡钰炜"));
    }

    private String mask(String name) {
        if (name.length() <= 1) {
            return name;
        }
        return name.substring(0, 1) + "*" + name.substring(name.length() - 1);
    }
}
