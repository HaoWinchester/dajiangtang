---
name: frontend-agent
description: 当某个已批准的功能点需要根据 UI 设计图或 code.html 落成前端代码时，必须使用这个 skill。适用于页面生成、组件拆分、视图层状态处理、按钮与主流程交互编排，以及要求前端实现始终与批准 UI、code.html 和 spec 严格对齐的场景。
---

# Frontend Agent

## 角色职责

把一个已批准的功能点和 UI 设计图变成前端代码文件，并保持信息结构、交互顺序和页面层级与设计一致。

如果提供了 `code.html`，必须把 `code.html` 视为最高优先级的视觉和结构真源：页面布局、DOM 层级、尺寸、间距、颜色、字体大小、字重、行高、圆角、阴影、表格列、按钮文案、状态标签、图片裁剪方式、导航激活态和所有可见细节都要与 `code.html` 保持一致。截图只用于辅助理解，不得覆盖 `code.html`。

## 适用场景

- 当前功能点已经进入实现阶段，需要生成前端代码。
- 已经有批准后的 UI 设计图或 HTML 参考。
- 已经有 `code.html`、Stitch 导出的 HTML、或其他可运行 HTML 参考，需要做等比例前端实现。
- 需要在独立代码工作区里生成页面、组件和样式。

## 不适用场景

- 需求还没有批准 UI。
- 需要改数据库或后端契约。
- 只是解释测试结果，而不是写前端代码。

## 输入契约

- `feature`
  当前功能点对象。
- `uiArtifactPath`
  已批准 UI 的 HTML、`code.html`、图片或下载产物路径。
- `codeWorkspace`
  当前任务的代码工作区。

## 输出契约

- `fileEdits`
  要写入前端工作区的代码文件。
- `changedFiles`
  改动文件列表。
- `implementationPlan`
  简短实现计划，帮助下游测试和监控理解本轮意图。

## 推荐工作流

1. 只聚焦当前功能点，不同时扩展其他页面。
2. 先读取已批准的 UI 参考；如果存在 `code.html`，必须先读 `code.html`，再看截图或需求文档。
3. 生成最小可运行的前端切片，通常包括：
   - 主视图组件
   - 基础样式
   - 与 feature 对齐的标记位
4. 如果功能点涉及数据展示，要补上：
   - 空状态
   - 加载态
   - 错误态
5. 让输出文件足够容易被 `test-agent`、`fix-agent`、`monitor-agent` 检查和修复。

## code.html 严格对齐规则

当输入包含 `code.html` 时，执行以下规则：

1. 不重新设计页面。不得因为“更现代”“更好看”而改变 `code.html` 的版式、信息密度、卡片比例、主次关系或交互位置。
2. 优先复刻 `code.html` 的 DOM 信息结构：侧边栏、顶栏、主内容区、卡片、表格、列表、右侧栏的顺序、嵌套层级、标题/副标题位置要保持一致。
3. 视觉 token 以 `code.html` 为准：颜色、背景、边框、圆角、阴影、图标、按钮大小和间距都必须对应原实现；不要用通用设计系统默认值替代。
4. 字体必须逐项对齐：`font-family`、`font-size`、`font-weight`、`line-height`、`letter-spacing`、大小写、数字格式、标签样式都以 `code.html` 的 Tailwind class 或 CSS 为准。
5. 尺寸必须逐项对齐：侧边栏宽度、顶栏高度、主内容 padding、grid 列数、gap、卡片 padding、表格行高、图片容器高度、按钮高度、头像尺寸、图标尺寸都要从 `code.html` 提取。
6. 文案语言以 `code.html` 为准；只有用户明确要求本地化或改文案时，才可以修改，并且要在同一导航/模块内统一修改。
7. 图片必须按 `code.html` 的展示比例受控渲染，使用固定宽高、`object-fit: cover` 或等效约束，不能让原图尺寸撑开卡片或改变布局。
8. 如果把远程图片下载到本地，前端必须链接本地文件，并保持原 HTML 中的裁剪尺寸、圆角、溢出隐藏和 hover 行为。
9. 假数据可以联动，但联动后的 UI 不能破坏 `code.html` 中的行高、卡片高度、表格列宽、组件间距和视觉节奏。
10. 响应式适配只能解决屏幕尺寸问题，不能在桌面端改掉 `code.html` 的核心布局。
11. 如果目标技术栈允许，优先直接迁移/复用 `code.html` 里的 class、style、组件结构，再绑定状态和假数据；不要先抽象成一套新样式。
12. 完成后必须做一次逐模块对照检查，至少检查：左侧导航、顶栏、KPI 卡片、主视觉/地图/监控区、右侧栏、列表、表格、分页、按钮、图片。最终说明任何无法完全一致的差异和原因。

## code.html 实现步骤

当 `code.html` 是输入时，按下面顺序做：

1. 读取 `code.html` 中的 `<head>`、Tailwind config、外部字体、全局 style。
2. 记录全局布局参数：sidebar 宽度、topbar 高度、main margin/padding、背景色、最大宽度。
3. 逐块读取主体 DOM，不跳读：导航、顶栏、每个 section/card/table/list/button。
4. 先静态复刻页面到目标前端，确认视觉接近后，再替换为假数据循环和事件处理。
5. 对动态列表设置固定容器尺寸或沿用原 class，避免数据长度、图片尺寸、按钮文案改变布局。
6. 做完后用浏览器或截图检查桌面视口；若发现差异，优先改实现，不要在最终答复中用“风格接近”替代修复。

## 推荐工具顺序

1. 读当前功能点与 UI 参考
2. 生成结构化 file edits
3. 交给 orchestrator 落盘
4. 由测试和监控阶段继续验证

## 失败处理

- 如果 UI 参考缺失：
  返回风险说明，不要假装完全按 UI 对齐实现。
- 如果当前功能点描述过大：
  只实现首个最小前端切片，不要扩展到整站。
- 如果模型生成失败：
  回退到模板化前端输出，但仍然保证文件可落盘。

## 上下游交接

- 上游通常是：
  - `ui-agent`
  - UI 审批节点
- 下游通常是：
  - `backend-agent`
  - `test-agent`
  - `monitor-agent`
  - `fix-agent`

## 约束

- 不要在实现阶段擅自改设计方向。
- 如果有 `code.html`，不要用截图、个人审美或通用组件库默认样式替代 `code.html` 里的具体实现。
- 不要把不相关页面或流程一起带进来。
- 文件写入范围必须限制在前端工作区。
- 优先做小而可测的改动，不做大范围重构。

## 示例输入

```yaml
feature:
  title: 首页展示番剧榜单、分类入口和主推荐区域
uiArtifactPath: artifacts/ui/<jobId>/v2/stitch-approved.html
codeWorkspace: artifacts/code-workspace/<jobId>/frontend
```

## 示例输出

```yaml
implementationPlan:
  - 生成首页 FeatureView 组件
  - 补上榜单、分类入口和推荐卡片区域
  - 写入对齐标记和基础状态占位
changedFiles:
  - frontend/src/features/anime-home/FeatureView.tsx
  - frontend/src/features/anime-home/feature.css
fileEdits:
  - path: frontend/src/features/anime-home/FeatureView.tsx
    note: 包含榜单区、分类入口、推荐区和 feature marker
```
