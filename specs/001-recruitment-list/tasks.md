# 任务清单：招聘信息列表页

**输入**：来自 `specs/001-recruitment-list/` 的设计文档
**前置条件**：`plan.md`、`spec.md`、`research.md`、`data-model.md`、`contracts/openapi.yaml`、`quickstart.md`
**项目宪章**：`.specify/memory/constitution.md`

## 用户故事拆分

- **US1 - 查看招聘信息列表**：已登录用户能看到招聘信息列表，字段包含岗位、薪资、公司名称、城市、负责人、需求人数，默认只展示正在招聘或有效岗位，并按最新发布或最近更新优先。
- **US2 - 搜索和翻页招聘信息**：已登录用户能按岗位和城市筛选招聘信息，清空条件后恢复默认列表，超过 10 条时可以翻页。
- **US3 - 管理员新增入口权限**：管理员能看到新增按钮，普通用户和企业用户看不到新增按钮。

## 阶段 1：准备

- [X] T001 创建 Java 后端项目骨架和依赖配置文件 `backend/pom.xml`
- [X] T002 创建 Vue 前端项目骨架和依赖配置文件 `frontend/package.json`
- [X] T003 配置前后端基础运行参数文件 `backend/src/main/resources/application.yml` 和 `frontend/.env.example`
- [X] T004 同步接口契约到后端和前端参考目录 `backend/src/main/resources/openapi/recruitments.yaml` 和 `frontend/src/contracts/recruitments.yaml`

## 阶段 2：基础能力

- [X] T005 [P] 创建招聘状态枚举 `backend/src/main/java/com/dajiangtang/recruitment/domain/RecruitmentStatus.java`
- [X] T006 [P] 创建用户角色枚举和标准城市名目录 `backend/src/main/java/com/dajiangtang/user/domain/UserRole.java` 和 `backend/src/main/java/com/dajiangtang/common/domain/CityCatalog.java`
- [X] T007 [P] 创建招聘信息实体 `backend/src/main/java/com/dajiangtang/recruitment/domain/Recruitment.java`
- [X] T008 创建招聘信息仓储接口 `backend/src/main/java/com/dajiangtang/recruitment/repository/RecruitmentRepository.java`
- [X] T009 创建当前用户角色解析组件 `backend/src/main/java/com/dajiangtang/security/CurrentUserRoleResolver.java`
- [X] T010 [P] 创建前端招聘信息类型定义 `frontend/src/features/recruitments/types.ts`
- [X] T011 [P] 创建前端招聘信息接口客户端基础文件 `frontend/src/features/recruitments/api.ts`

## 阶段 3：用户故事 1 - 查看招聘信息列表

**目标**：已登录用户进入招聘信息列表页后，可以看到默认招聘信息列表和必需字段。

**独立测试标准**：使用任一已登录角色访问列表页，页面展示岗位、薪资、公司名称、城市、负责人、需求人数；默认结果仅包含正在招聘或有效岗位，并按最新发布或最近更新优先。

- [X] T012 [P] [US1] 添加招聘列表后端查询测试 `backend/src/test/java/com/dajiangtang/recruitment/RecruitmentListQueryTest.java`
- [X] T013 [P] [US1] 添加招聘列表前端渲染测试 `frontend/src/features/recruitments/RecruitmentListView.spec.ts`
- [X] T014 [US1] 创建招聘列表响应对象并包含 `canCreate` 字段 `backend/src/main/java/com/dajiangtang/recruitment/dto/RecruitmentListResponse.java` 和 `backend/src/main/java/com/dajiangtang/recruitment/dto/RecruitmentListItemResponse.java`
- [X] T015 [US1] 创建分页响应对象 `backend/src/main/java/com/dajiangtang/common/dto/PageResponse.java`
- [X] T016 [US1] 实现默认招聘列表查询服务 `backend/src/main/java/com/dajiangtang/recruitment/service/RecruitmentQueryService.java`
- [X] T017 [US1] 实现招聘列表查询接口 `backend/src/main/java/com/dajiangtang/recruitment/controller/RecruitmentController.java`
- [X] T018 [US1] 实现前端招聘列表接口调用 `frontend/src/features/recruitments/api.ts`
- [X] T019 [US1] 实现招聘列表页面表格和加载状态 `frontend/src/features/recruitments/RecruitmentListView.vue`
- [X] T020 [US1] 注册招聘列表路由 `frontend/src/router/index.ts`

## 阶段 4：用户故事 2 - 搜索和翻页招聘信息

**目标**：用户可以按岗位关键词、标准城市名搜索招聘信息，并使用默认每页 10 条的分页能力。

**独立测试标准**：输入岗位关键词时返回匹配岗位；输入城市时返回标准城市名匹配结果；两个条件同时存在时结果同时满足两个条件；清空条件恢复默认列表；超过 10 条时可翻页；空结果和加载失败有可见提示。

- [X] T021 [P] [US2] 添加后端搜索和分页测试 `backend/src/test/java/com/dajiangtang/recruitment/RecruitmentSearchPaginationTest.java`
- [X] T022 [P] [US2] 添加前端搜索、翻页、空状态和错误状态测试 `frontend/src/features/recruitments/RecruitmentSearchPagination.spec.ts`
- [X] T023 [US2] 创建招聘列表查询参数对象并接入标准城市名校验 `backend/src/main/java/com/dajiangtang/recruitment/dto/RecruitmentListQuery.java`
- [X] T024 [US2] 在招聘查询服务中实现岗位模糊匹配、标准城市名匹配、有效状态过滤和默认排序 `backend/src/main/java/com/dajiangtang/recruitment/service/RecruitmentQueryService.java`
- [X] T025 [US2] 在招聘列表接口中接入查询参数和分页返回 `backend/src/main/java/com/dajiangtang/recruitment/controller/RecruitmentController.java`
- [X] T026 [US2] 实现前端搜索表单和清空条件行为 `frontend/src/features/recruitments/RecruitmentListView.vue`
- [X] T027 [US2] 实现前端分页控件和翻页请求行为 `frontend/src/features/recruitments/RecruitmentListView.vue`
- [X] T028 [US2] 实现前端空状态、错误状态和重试行为 `frontend/src/features/recruitments/RecruitmentListView.vue`

## 阶段 5：用户故事 3 - 管理员新增入口权限

**目标**：管理员可以看到新增按钮并进入新增流程入口，普通用户和企业用户看不到新增按钮。

**独立测试标准**：管理员请求列表时返回可新增权限，页面显示新增按钮；普通用户和企业用户请求列表时不显示新增按钮；未登录访问列表接口返回未登录错误。

- [X] T029 [P] [US3] 添加后端新增入口权限测试 `backend/src/test/java/com/dajiangtang/recruitment/RecruitmentCreatePermissionTest.java`
- [X] T030 [P] [US3] 添加前端新增按钮可见性测试 `frontend/src/features/recruitments/RecruitmentCreateButton.spec.ts`
- [X] T031 [US3] 在当前用户角色解析组件中实现管理员可新增判定 `backend/src/main/java/com/dajiangtang/security/CurrentUserRoleResolver.java`
- [X] T032 [US3] 在招聘列表接口中根据当前用户角色返回正确的 `canCreate` 值 `backend/src/main/java/com/dajiangtang/recruitment/controller/RecruitmentController.java`
- [X] T033 [US3] 在前端类型和接口客户端中接入 `canCreate` 字段 `frontend/src/features/recruitments/types.ts` 和 `frontend/src/features/recruitments/api.ts`
- [X] T034 [US3] 在招聘列表页中仅对管理员展示新增按钮 `frontend/src/features/recruitments/RecruitmentListView.vue`
- [X] T035 [US3] 创建招聘新增流程完整表单页 `frontend/src/features/recruitments/RecruitmentCreateEntryView.vue`
- [X] T036 [US3] 配置新增按钮跳转到招聘新增流程表单页 `frontend/src/router/index.ts`

## 最终阶段：完善

- [X] T037 执行后端测试并记录结果 `backend/pom.xml`
- [X] T038 执行前端测试并记录结果 `frontend/package.json`
- [X] T039 按快速开始文档完成手工验收记录 `specs/001-recruitment-list/quickstart.md`
- [X] T040 执行项目宪章合规复核 `specs/001-recruitment-list/plan.md`
- [X] T041 更新实现说明和已知限制 `specs/001-recruitment-list/implementation-notes.md`

## 依赖关系

- 阶段 1 必须先完成，为前后端代码提供项目骨架。
- 阶段 2 必须在所有用户故事前完成，为模型、权限、接口客户端提供共享基础。
- US1 是 MVP，必须先完成，因为 US2 和 US3 都依赖列表接口和页面基础。
- US2 可在 US1 完成后独立开发和测试。
- US3 可在 US1 完成后独立开发和测试。
- 最终阶段在 US1、US2、US3 完成后执行。

## 并行执行示例

- 阶段 2 中，T005、T006、T007、T010、T011 可以并行执行。
- US1 中，T012 和 T013 可以并行编写；T014 和 T015 可以并行编写。
- US2 中，T021 和 T022 可以并行编写；T026、T027、T028 修改同一页面文件，需要串行或由同一人处理。
- US3 中，T029 和 T030 可以并行编写；T033 可以在 T014 的响应字段确定后与 T031、T032 并行。

## 实现策略

1. 先交付 US1，形成可查看招聘信息列表的 MVP。
2. 再交付 US2，让列表具备搜索、翻页、空状态和错误状态。
3. 最后交付 US3，完成管理员新增入口权限展示。
4. 每个用户故事完成后都按独立测试标准验收，再进入下一故事。

## 格式校验

- 所有任务均使用 `- [ ] Txxx` 检查项格式。
- 用户故事阶段任务均带有 `[US1]`、`[US2]` 或 `[US3]` 标签。
- 可并行任务使用 `[P]` 标签。
- 每条任务均包含明确文件路径。
