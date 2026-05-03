package com.dajiangtang.recruitment.repository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;

import com.dajiangtang.recruitment.domain.Recruitment;
import com.dajiangtang.recruitment.domain.RecruitmentStatus;

@Repository
@ConditionalOnProperty(name = "app.persistence", havingValue = "memory", matchIfMissing = true)
public class InMemoryRecruitmentRepository implements RecruitmentRepository {

    private final List<Recruitment> recruitments = new ArrayList<>(List.of(
            recruitment("rec-001", "项目经理", "15k-25k", "北京示例科技有限公司", "北京市", "赵义民", 3, true,
                    RecruitmentStatus.RECRUITING, "2026-04-20T09:00:00Z", "2026-04-25T09:00:00Z"),
            recruitment("rec-002", "Java 后端工程师", "20k-35k", "上海云启软件有限公司", "上海市", "钱启航", 5, false,
                    RecruitmentStatus.ACTIVE, "2026-04-21T09:00:00Z", "2026-04-26T09:00:00Z"),
            recruitment("rec-003", "前端工程师", "18k-30k", "深圳灵犀互动有限公司", "深圳市", "孙若水", 4, false,
                    RecruitmentStatus.RECRUITING, "2026-04-22T09:00:00Z", "2026-04-22T09:00:00Z"),
            recruitment("rec-004", "数据分析师", "16k-28k", "杭州数智科技有限公司", "杭州市", "李文清", 2, true,
                    RecruitmentStatus.ACTIVE, "2026-04-19T09:00:00Z", "2026-04-27T09:00:00Z"),
            recruitment("rec-005", "产品经理", "18k-32k", "北京创想网络有限公司", "北京市", "周一鸣", 1, false,
                    RecruitmentStatus.ACTIVE, "2026-04-18T09:00:00Z", "2026-04-24T09:00:00Z"),
            recruitment("rec-006", "测试工程师", "12k-20k", "广州质量云有限公司", "广州市", "吴知远", 3, false,
                    RecruitmentStatus.RECRUITING, "2026-04-17T09:00:00Z", "2026-04-23T09:00:00Z"),
            recruitment("rec-007", "运维工程师", "14k-24k", "成都稳定科技有限公司", "成都市", "郑青山", 2, false,
                    RecruitmentStatus.ACTIVE, "2026-04-16T09:00:00Z", "2026-04-21T09:00:00Z"),
            recruitment("rec-008", "算法工程师", "28k-45k", "上海智算未来有限公司", "上海市", "王可为", 2, true,
                    RecruitmentStatus.RECRUITING, "2026-04-15T09:00:00Z", "2026-04-28T09:00:00Z"),
            recruitment("rec-009", "安全工程师", "22k-38k", "南京安云科技有限公司", "南京市", "冯澄", 1, true,
                    RecruitmentStatus.ACTIVE, "2026-04-14T09:00:00Z", "2026-04-20T09:00:00Z"),
            recruitment("rec-010", "销售经理", "13k-25k", "武汉拓客科技有限公司", "武汉市", "陈远", 6, false,
                    RecruitmentStatus.RECRUITING, "2026-04-13T09:00:00Z", "2026-04-19T09:00:00Z"),
            recruitment("rec-011", "人力资源专员", "9k-15k", "西安诚聘服务有限公司", "西安市", "刘晓", 2, false,
                    RecruitmentStatus.ACTIVE, "2026-04-12T09:00:00Z", "2026-04-18T09:00:00Z"),
            recruitment("rec-012", "客户成功经理", "12k-22k", "深圳企服科技有限公司", "深圳市", "何念", 3, false,
                    RecruitmentStatus.RECRUITING, "2026-04-11T09:00:00Z", "2026-04-17T09:00:00Z"),
            recruitment("rec-013", "Java 架构师", "35k-55k", "北京平台科技有限公司", "北京市", "马骁", 1, true,
                    RecruitmentStatus.ACTIVE, "2026-04-23T09:00:00Z", "2026-04-29T09:00:00Z"),
            recruitment("rec-014", "CSPM 顾问", "25k-40k", "北京合规科技有限公司", "北京市", "唐砚", 1, true,
                    RecruitmentStatus.CLOSED, "2026-04-24T09:00:00Z", "2026-04-30T09:00:00Z"),
            recruitment("rec-015", "招聘专员", "8k-13k", "上海人才服务有限公司", "上海市", "朱宁", 2, false,
                    RecruitmentStatus.PAUSED, "2026-04-10T09:00:00Z", "2026-04-16T09:00:00Z")
    ));

    @Override
    public synchronized List<Recruitment> findAll() {
        return List.copyOf(recruitments);
    }

    @Override
    public synchronized Optional<Recruitment> findById(String id) {
        return recruitments.stream()
                .filter(recruitment -> recruitment.id().equals(id))
                .findFirst();
    }

    @Override
    public synchronized Recruitment save(Recruitment recruitment) {
        recruitments.removeIf(item -> item.id().equals(recruitment.id()));
        recruitments.add(recruitment);
        return recruitment;
    }

    private static Recruitment recruitment(
            String id,
            String position,
            String salary,
            String companyName,
            String city,
            String owner,
            int headcount,
            boolean cspmPreferred,
            RecruitmentStatus status,
            String publishedAt,
            String updatedAt
    ) {
        return new Recruitment(
                id,
                position,
                salary,
                companyName,
                "业务部",
                position,
                cspmPreferred ? "CSPM优先" : "",
                city,
                city,
                owner,
                headcount,
                cspmPreferred,
                status,
                Instant.parse(publishedAt),
                Instant.parse(updatedAt),
                "13800000000",
                null,
                status.name(),
                "负责岗位相关项目交付与团队协作。",
                "具备相关岗位经验，沟通能力强。",
                "项目管理、沟通协作",
                "五险一金、带薪年假",
                owner,
                "P4",
                ""
        );
    }
}
