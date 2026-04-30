# 实现说明：招聘信息列表页

## 完成范围

- Java / Spring Boot 后端骨架已创建。
- Vue + TypeScript 前端骨架已创建。
- 已实现 `GET /api/recruitments` 招聘信息列表接口。
- 已实现招聘信息列表页、岗位搜索、城市搜索、清空搜索、分页、空状态、错误状态和重试。
- 已实现管理员新增入口权限：`canCreate=true` 时显示新增按钮，并跳转到招聘新增流程入口占位页。
- 已实现前端路由守卫：未登录访客不能进入招聘信息列表页或新增入口占位页。
- 已同步 OpenAPI 契约到前后端参考目录。

## 后端实现

- 当前使用内存仓储和种子数据，保留 `domain`、`repository`、`service`、`controller` 分层。
- 通过 `X-User-Role` 请求头或 `USER_ROLE` cookie 模拟当前用户角色。
- 未登录或非法角色返回 `401`。
- 默认只返回 `RECRUITING` / `ACTIVE` 状态招聘信息。
- 岗位使用关键词模糊匹配，城市使用标准城市名匹配。
- 默认每页 10 条，按 `publishedAt` / `updatedAt` 最近优先排序。
- 列表响应只暴露允许字段，不返回联系电话等详情字段。

## 前端实现

- 招聘列表页位于 `frontend/src/features/recruitments/RecruitmentListView.vue`。
- 招聘新增流程入口占位页位于 `frontend/src/features/recruitments/RecruitmentCreateEntryView.vue`。
- API 客户端位于 `frontend/src/features/recruitments/api.ts`。
- 类型定义位于 `frontend/src/features/recruitments/types.ts`。
- 前端通过 `VITE_API_BASE_URL` 配置后端地址；未配置时使用相对路径 `/api/recruitments`。

## 验证结果

- 后端：`JAVA_HOME=/opt/homebrew/opt/openjdk@17 PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH" mvn test`
  - 结果：通过，12 个测试全部通过。
- 前端：`npm_config_cache=./.npm-cache npm ci && npm test && npm run build`
  - 结果：通过，4 个测试文件、11 个测试全部通过，生产构建成功。

## 环境说明

- 已通过 Homebrew 安装 `openjdk@17` 和 `maven`。
- 当前 shell 中使用 `JAVA_HOME=/opt/homebrew/opt/openjdk@17` 运行后端测试。
- 如果希望系统 Java wrapper 也能直接发现 JDK，可按 Homebrew 提示另行创建系统级 symlink；本次未修改全局 shell 配置。

## 已知限制

- 招聘新增表单不在本功能范围内，当前只提供入口占位页。
- 后端当前使用内存数据，后续接入真实数据库时需要替换 repository 实现并保留当前接口契约。
