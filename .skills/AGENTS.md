# 大讲堂 Agent Instructions

本文件用于告诉进入本仓库工作的智能体，如何优先发现和使用本项目自带的本地 skills，以及在需求澄清、规划、实现和验证阶段应遵循的统一流程。

## 1. 本地 Skills 是项目内第一优先级

本仓库根目录下存在本地 skills 目录：

- `./.skills`

约定如下：

- 将 `./.skills/<skill-name>/SKILL.md` 视为本项目内可用的本地 skill。
- 当任务明显匹配某个本地 skill 时，优先读取并遵循该本地 skill。
- 如果本地 skill 与全局同名 skill 同时存在，默认优先使用本地版本，除非用户明确要求使用全局版本。
- 不要忽略本地 skill 后再自创一套平行流程。

## 2. Speckit 流程必须优先沿用现成链路

本仓库内已经放入一整套 Speckit 相关 skills：

- `speckit-constitution`
- `speckit-specify`
- `speckit-clarify`
- `speckit-plan`
- `speckit-tasks`
- `speckit-analyze`
- `speckit-implement`
- `speckit-checklist`
- `speckit-baseline`
- `speckit-taskstoissues`

如果任务涉及“从需求到规格、计划、任务、实现”的完整交付流程，优先遵循下面这条链：

1. `speckit-constitution`
2. `speckit-specify`
3. `speckit-clarify`
4. `speckit-plan`
5. `speckit-tasks`
6. `speckit-analyze`
7. `speckit-implement`

要求如下：

- 不要跳过 `specify / clarify` 就直接开始写代码。
- 不要在已经存在 Speckit 链路时，再发明一套平行的需求文档格式。
- 规划、任务、实现应尽量落到 `specs/<feature>/` 目录下的标准产物链中。

### Speckit 各步骤示例

下面示例使用“大讲堂人才库 / 招聘信息”作为同一条需求的上下文，方便智能体理解每一步应该做什么。

#### 1. `speckit-constitution`：建立或更新项目宪章

适用场景：用户提供角色、页面、字段、权限边界、隐私要求等全局规则。

示例输入：

```text
$speckit-constitution
权限角色：管理员、普通用户、企业用户。
首页展示脱敏招聘信息；管理员可以新增招聘信息；普通用户维护个人中心；
企业用户维护企业中心；注册必须展示隐私承诺文本。
```

期望动作：

- 更新 `.specify/memory/constitution.md`。
- 把角色权限、必需页面字段、隐私脱敏、CSPM 信号写成可检查规则。
- 同步更新 `.specify/templates/plan-template.md`、`spec-template.md`、`tasks-template.md`。

示例产出：

```text
项目宪章 v1.0.0 已制定。
新增原则：角色权限、页面字段契约、隐私脱敏、列表检索、登录注册校验、CSPM 信号。
```

#### 2. `speckit-specify`：把需求整理成功能规格

适用场景：用户提出一个新功能，但还没有结构化规格。

示例输入：

```text
$speckit-specify
做招聘信息列表页，支持按岗位和城市搜索，管理员能看到新增按钮。
列表展示岗位、薪资、公司名称、城市、负责人、需求人数。
```

期望动作：

- 创建 `specs/<feature>/spec.md`。
- 写清楚用户故事、角色范围、功能需求、必需字段、成功标准。
- 对齐宪章中的“招聘信息页面”要求。

示例产出片段：

```markdown
## 功能需求

- 需求-001：系统必须展示招聘信息列表。
- 需求-002：系统必须支持按岗位和城市搜索。
- 需求-003：系统必须仅向管理员展示新增按钮。
```

#### 3. `speckit-clarify`：补齐不明确的问题

适用场景：规格里存在字段含义、权限范围、数据来源或验收标准不清楚。

示例输入：

```text
$speckit-clarify
请检查招聘信息列表规格里还有哪些需要澄清。
```

期望动作：

- 提出最多 5 个关键澄清问题。
- 将用户回答写回 `spec.md` 的澄清记录。
- 不把未确认假设直接当成需求。

示例问题：

```text
1. 普通用户和企业用户是否可以查看完整招聘列表，还是只能看脱敏信息？
2. 搜索城市时是否需要支持模糊匹配，例如“北京”匹配“北京市”？
3. 招聘信息列表默认按什么字段排序？
```

#### 4. `speckit-plan`：生成实现计划

适用场景：规格已经明确，需要设计技术路径、数据结构、接口和验证策略。

示例输入：

```text
$speckit-plan
基于 specs/recruitment-list/spec.md 生成实现计划。
```

期望动作：

- 创建或更新 `specs/<feature>/plan.md`。
- 明确运行环境、框架、数据层、权限策略、接口契约和测试策略。
- 逐项完成宪章检查。

示例产出片段：

```markdown
## 宪章检查

- [x] 已说明管理员、普通用户、企业用户以及未登录访客的访问权限。
- [x] 已保留招聘列表必需展示字段。
- [x] 已覆盖按岗位、城市搜索和翻页能力。
```

#### 5. `speckit-tasks`：拆分可执行任务

适用场景：计划已确定，需要生成开发任务清单。

示例输入：

```text
$speckit-tasks
请根据 specs/recruitment-list/plan.md 拆分任务。
```

期望动作：

- 创建或更新 `specs/<feature>/tasks.md`。
- 按准备、基础能力、用户故事、测试、验收顺序拆分。
- 每个任务都能被单独执行和验证。

示例产出片段：

```markdown
- [ ] T001 定义招聘信息列表查询参数和返回字段。
- [ ] T002 实现按岗位、城市筛选的接口。
- [ ] T003 实现列表页表格、搜索框和翻页控件。
- [ ] T004 增加管理员可见的新增按钮权限测试。
```

#### 6. `speckit-analyze`：检查规格、计划和任务一致性

适用场景：已经有 `spec.md`、`plan.md`、`tasks.md`，需要找出遗漏、冲突和偏航。

示例输入：

```text
$speckit-analyze
请检查 specs/recruitment-list 下的 spec、plan、tasks 是否一致。
```

期望动作：

- 不直接改代码。
- 列出阻断问题、重要风险、轻微问题。
- 明确指出文件和章节。

示例产出：

```text
发现 1 个阻断问题：
- tasks.md 没有覆盖“新增按钮仅管理员可见”的权限测试，但 spec.md 将其列为必须需求。
```

#### 7. `speckit-implement`：按任务执行实现

适用场景：规格、计划、任务已经通过检查，可以进入代码实现。

示例输入：

```text
$speckit-implement
执行 specs/recruitment-list/tasks.md 中的任务，先完成列表查询和前端列表页。
```

期望动作：

- 按 `tasks.md` 顺序执行，不绕过规格。
- 实现后运行相关测试或说明无法运行的原因。
- 更新任务完成状态或交付说明。

示例产出：

```text
已完成招聘列表接口和列表页。
验证：搜索岗位、搜索城市、翻页、管理员新增按钮可见性均已通过本地测试。
```

#### 8. `speckit-checklist`：生成验收检查清单

适用场景：需要给评审、验收或发布前检查提供清单。

示例输入：

```text
$speckit-checklist
为招聘信息列表页生成验收检查清单。
```

期望动作：

- 基于规格和宪章生成可勾选清单。
- 覆盖字段、权限、搜索、翻页、隐私和异常状态。

示例产出片段：

```markdown
- [ ] 管理员能看到新增按钮。
- [ ] 普通用户和企业用户看不到新增按钮。
- [ ] 按岗位搜索能返回匹配结果。
- [ ] 按城市搜索能返回匹配结果。
```

#### 9. `speckit-baseline`：从现有代码反推规格

适用场景：项目已有实现，但缺少规格文档，需要补齐基线。

示例输入：

```text
$speckit-baseline
请根据当前招聘信息相关页面和接口生成基线规格。
```

期望动作：

- 分析现有代码和页面行为。
- 生成描述当前实现的规格草稿。
- 标出与宪章不一致或缺失的能力。

示例产出：

```text
当前实现已有岗位和城市搜索，但缺少“需求人数”列。
当前实现没有区分管理员新增按钮权限，需要后续修正。
```

#### 10. `speckit-taskstoissues`：把任务转成 GitHub 议题

适用场景：`tasks.md` 已经稳定，需要拆成可分配的议题。

示例输入：

```text
$speckit-taskstoissues
把 specs/recruitment-list/tasks.md 转成 GitHub 议题。
```

期望动作：

- 将任务拆成标题明确、验收标准清楚、依赖关系可见的议题。
- 保留任务编号、规格链接和宪章相关检查点。

示例议题：

```markdown
标题：实现招聘信息列表的岗位和城市搜索

范围：
- 支持岗位关键词筛选
- 支持城市筛选
- 保留翻页参数

验收：
- 搜索条件为空时返回默认列表
- 岗位搜索能匹配招聘岗位字段
- 城市搜索能匹配工作地点字段
```

## 3. 项目内 Agent Skills 的使用原则

除 Speckit 之外，本仓库还包含一组交付角色型 skills：

- `spec-agent`
- `ui-agent`
- `frontend-agent`
- `backend-agent`
- `db-agent`
- `test-agent`
- `fix-agent`
- `monitor-agent`
- `acceptance-agent`
- `deploy-agent`
- `dev-agent`

使用原则：

- 涉及需求澄清与规格整理时，优先参考 `spec-agent`。
- 涉及界面组织、设计输入转实现时，优先参考 `ui-agent` 与 `frontend-agent`。
- 涉及后端接口、服务、契约时，优先参考 `backend-agent`。
- 涉及 Prisma / PostgreSQL / 数据层变更时，优先参考 `db-agent`。
- 涉及测试、修复、偏航检查、验收、发布时，分别参考对应 skill。

## 4. 读取顺序建议

当用户提出一个新任务时，推荐按下面顺序建立上下文：

1. 阅读本文件 `AGENTS.md`
2. 查看 `./.skills/README.md`
3. 如果任务匹配 Speckit 生命周期，优先阅读对应 `./.skills/speckit-*/SKILL.md`
4. 如果任务匹配具体交付角色，再阅读对应 `./.skills/*-agent/SKILL.md`
5. 只在确有需要时再深入读取更多项目文件

## 5. 项目内约束

- 优先复用本仓库已有约定、模板和 artifact 目录，而不是自行定义新目录。
- 如果已经存在 `specs/`、`.specify/`、`.skills/`，默认它们就是本项目的工作真源之一。
- 当用户询问“为什么没用上 skill”时，应先检查 `./.skills` 下是否已有可匹配的本地 skill。
- 当本地 skill 足以覆盖任务时，不要绕开它们去完全依赖外部习惯流程。

## 6. 对 Codex / Claude Code 的期待

本文件的目标不是保证任何系统“100% 自动发现所有本地 skills”，而是：

- 显式声明本仓库存在本地 skills
- 明确要求优先使用这些本地 skills
- 减少智能体忽略本地技能、转而自创流程的概率

如果你是进入本仓库工作的智能体，请把 `./.skills` 视为本项目的重要上下文来源。
