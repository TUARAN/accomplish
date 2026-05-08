# P0 修复记录与后续 P1-P4 待办

日期：2026-05-08

本文用于记录当前工作区已经完成的 P0 修复，以及后续建议继续推进的 P1-P4 问题。目标是让后续 AI、Claude Code 或人工开发者可以直接接手，不需要重新翻这轮上下文。

## 已完成的 P0 修复

### P0.1 `better-sqlite3` Node ABI 不匹配

问题：

- `packages/agent-core` 测试失败，因为 `better-sqlite3` 被编译到了 Electron ABI `NODE_MODULE_VERSION 145`。
- 当前本地 Node v22.17.0 需要 ABI `127`。
- 失败影响 storage、skills、favorites 等依赖 SQLite 的测试链路。

修改文件：

- `scripts/ensure-node-native-modules.cjs`
- `packages/agent-core/package.json`

具体改动：

- 新增 Node 原生依赖检测脚本。
- 测试前会检查 `better-sqlite3` 是否能在当前 Node 运行时下打开内存数据库。
- 如果发现 ABI 或 native load 错误，会删除旧的 native build 输出，并重新为 Node 测试环境 rebuild `better-sqlite3`。
- 将该脚本接入 `@accomplish_ai/agent-core` 的 `pretest`。

结果：

- `pnpm -F @accomplish_ai/agent-core test` 已恢复通过。

后续注意：

- Node 测试 rebuild 和 Electron rebuild 必须保持分离。
- Electron 开发、打包前仍需要 Electron ABI rebuild，不能复用 Node ABI 产物。

### P0.2 Web 集成测试大量失败

问题：

- `pnpm -F @accomplish/web test` 中集成测试大面积失败。
- 主要原因包括 IPC mock 过期、Zustand selector mock 行为不正确、UI 断言落后于当前实现、部分真实交互行为没有被稳定覆盖。

修改文件：

- `apps/web/__tests__/setup.ts`
- `apps/web/__tests__/integration/renderer/App.integration.test.tsx`
- `apps/web/__tests__/integration/renderer/components/SettingsDialog.integration.test.tsx`
- `apps/web/__tests__/integration/renderer/components/Sidebar.integration.test.tsx`
- `apps/web/__tests__/integration/renderer/components/TaskHistory.integration.test.tsx`
- `apps/web/__tests__/integration/renderer/components/TaskInputBar.integration.test.tsx`
- `apps/web/__tests__/integration/renderer/components/TaskLauncher.integration.test.tsx`
- `apps/web/__tests__/integration/renderer/pages/Execution.integration.test.tsx`
- `apps/web/__tests__/integration/renderer/pages/History.integration.test.tsx`
- `apps/web/__tests__/integration/renderer/pages/Home.integration.test.tsx`

具体改动：

- 补齐当前 `window.accomplish` API 所需的测试 mock。
- 给相关测试 mock 增加 `useAccomplish`、`getBuildCapabilities` 等当前组件依赖的 API。
- 修复 `useTaskStore(selector)` 的 mock 行为，让 mock 能真正执行 selector，而不是总是返回整个 store 对象。
- 更新 SettingsDialog 的断言，改为匹配当前设计 token，例如 `bg-provider-bg-active`。
- 更新 Home 的 provider 保存流程 mock，让“保存 API key”后 provider 状态真正变为 ready。
- 更新 Execution 页面权限、Slack auth resume 等测试，使其匹配当前 UI 和异步加载行为。

结果：

- `pnpm -F @accomplish/web test:integration` 已恢复通过：12 个测试文件，385 个用例。
- `pnpm -F @accomplish/web test` 已恢复通过：285 个 unit 用例，385 个 integration 用例。

### P0.3 Slash command API 兼容性

问题：

- `apps/web/src/client/hooks/useSlashCommand.ts` 默认假设 `getEnabledSkills` 一定存在。
- 在旧 preload 或部分测试 mock 环境中，该 API 不存在，会持续输出 `getEnabledSkills is not a function`。
- 影响 Slash command、首页输入体验和测试稳定性。

修改文件：

- `apps/web/src/client/hooks/useSlashCommand.ts`
- `apps/web/__tests__/setup.ts`
- `apps/web/__tests__/integration/renderer/components/TaskInputBar.integration.test.tsx`

具体改动：

- `useSlashCommand` 优先使用 `getEnabledSkills`。
- 如果只有旧 API `getSkills`，则 fallback 到 `getSkills().filter(skill => skill.isEnabled)`。
- 如果两个 API 都不存在，则静默返回缓存 skills，避免无意义错误日志。
- 测试 mock 补齐 `getEnabledSkills`。

结果：

- Slash command 集成测试通过。
- 旧 API 或 mock 环境下不再刷错误日志。

### P0.4 Azure Foundry proxy 固定端口冲突

问题：

- `packages/agent-core/src/opencode/proxies/azure-foundry-proxy.ts` 固定使用端口 `9228`。
- 多实例、测试并发、已有 Accomplish 进程监听时，会出现 `Port 9228 is already in use`。

修改文件：

- `packages/agent-core/src/opencode/proxies/azure-foundry-proxy.ts`
- `packages/agent-core/tests/unit/opencode/proxies/azure-foundry-proxy.test.ts`

具体改动：

- 保留默认生产端口 `9228`。
- 新增 `ACCOMPLISH_AZURE_FOUNDRY_PROXY_PORT` 环境变量。
- 支持传入 `0`，让系统自动分配随机端口，主要用于测试。
- 记录实际 active listening port，不再假设实际端口等于请求端口。
- 如果请求的非零端口被占用，会 fallback 到随机端口。
- 测试改为使用随机端口，并断言实际 proxy URL 和 port 行为。

结果：

- Azure Foundry proxy 测试不再和本地已有监听冲突。
- 默认生产行为仍保持端口 `9228`。

### P0.5 相关运行时与测试稳定性修复

修改文件：

- `apps/web/src/client/stores/daemonStore.ts`
- `apps/web/src/client/pages/execution/useExecutionEvents.ts`
- `apps/web/src/client/stores/task-subscriptions.ts`
- `apps/web/src/client/components/landing/TaskInputToolbar.tsx`
- `apps/web/src/client/components/execution/MessageTaskAction.tsx`
- `apps/web/src/client/pages/execution/useExecutionPauseActions.ts`
- `apps/web/src/client/components/settings/ProviderGrid.tsx`
- `apps/web/src/client/components/TaskLauncher/TaskLauncher.tsx`
- `apps/web/src/client/components/TaskLauncher/TaskLauncherContent.tsx`

具体改动：

- daemon 事件订阅改成可选注册，兼容旧 preload 和测试 mock。
- `daemonPing` 缺失时不再导致模块初始化崩溃。
- 任务运行中或 loading 状态下，输入栏 Stop 按钮保持可点击。
- Execution 页面 Slack auth action 按钮增加 `type="button"` 和稳定 `data-testid`。
- Execution 的 task action callback 在点击时读取最新 `isConnectorAuthPause`，避免闭包拿到过期状态。
- `ProviderGrid` 兼容没有 `getBuildCapabilities` 的旧 API。
- TaskLauncher 关闭行为去掉双重触发，避免 Radix close 和手动 close 重复执行。

## 已完成验证

以下命令已通过：

- `pnpm -F @accomplish_ai/agent-core test`
- `pnpm -F @accomplish/web test:integration`
- `pnpm -F @accomplish/web test`
- `pnpm typecheck`
- `pnpm lint:eslint`
- `pnpm format:check`
- `pnpm build`

仍存在的已知 warning：

- `pnpm lint:eslint` 通过，但仍有既有 React hook warnings：
  - `apps/web/src/client/components/settings/DaemonSection.tsx`
  - `apps/web/src/client/components/settings/integrations/useWhatsAppCard.ts`
  - `apps/web/src/client/components/settings/integrations/useWhatsAppSubscriptions.ts`
  - `apps/web/src/client/components/settings/useKnowledgeNotes.ts`
  - `apps/web/src/client/hooks/useTaskInputBehavior.ts`
- `pnpm build` 通过，但仍有既有构建 warning：
  - web 主 chunk 超过 500 kB
  - ineffective dynamic import
  - deprecated inline dynamic imports
  - dev-browser MCP tooling 中存在 direct eval warning

## 后续待办清单

### P1：产品关键体验与可靠性

1. 统一 daemon UI 状态模型
   - 范围：`apps/web/src/client/stores/daemonStore.ts`、`apps/web/src/client/components/settings/DaemonSection.tsx`、`apps/web/src/client/components/layout/DaemonConnectionToast.tsx`、Execution reconnect 逻辑。
   - 当前问题：daemon 状态假设分散在 store、toast、settings、execution 页面。
   - 改造目标：统一 `connected`、`stopped`、`reconnecting`、`reconnect-failed`、重试等状态和 UI 表达。
   - 验收标准：daemon stop/restart/reconnect 流程 UI 状态稳定，并有集成测试覆盖。

2. 加固 Home 提交与 provider 设置流程
   - 范围：`apps/web/src/client/pages/home/useHomePage.ts`、`apps/web/src/client/pages/home/useHomePageSettings.ts`、SettingsDialog provider 保存流程。
   - 当前问题：provider readiness、resume-after-settings 逻辑容易回归，当前主要靠 mock 保护。
   - 改造目标：把 `submit -> provider check -> settings -> resume` 明确成状态机或清晰流程。
   - 验收标准：覆盖无 provider、有 provider、保存 provider 后继续执行、取消 settings、E2E mode 等路径。

3. 改善任务中断反馈
   - 范围：`apps/web/src/client/components/landing/TaskInputToolbar.tsx`、`apps/web/src/client/pages/Execution.tsx`、`apps/web/src/client/stores/taskStore.ts`。
   - 当前问题：Stop 按钮已可点击，但中断请求过程中的 pending、成功、失败反馈仍不够明确。
   - 改造目标：增加 interrupt pending、interrupt failed、interrupt success 的 UI 状态。
   - 验收标准：点击 Stop 后有明确 loading/disabled/error fallback，不会重复触发或无反馈。

4. 稳定 OAuth connector resume 流程
   - 范围：`apps/web/src/client/pages/execution/useExecutionPauseActions.ts`、`apps/web/src/client/components/settings/connectors/*`、Slack MCP IPC handlers。
   - 当前问题：Slack auth resume 依赖多个异步状态检查，且容易受 SettingsDialog 预取状态影响。
   - 改造目标：把 execution 页 connector auth action 状态和 settings 预取状态隔离。
   - 验收标准：无论 SettingsDialog 是否挂载、是否关闭、是否在后台加载，Execution 页面 Slack auth resume 都稳定可用。

5. 增加 desktop dev 启动 smoke 测试
   - 范围：`apps/desktop/e2e`、`apps/web` 核心路由。
   - 当前问题：unit/integration 通过不等于 Electron preload/renderer 真实集成一定通过。
   - 改造目标：增加最小 Electron smoke：启动、daemon ping、任务输入、打开 settings。
   - 验收标准：`pnpm -F @accomplish/desktop test:e2e:native:fast` 能覆盖本地开发启动路径。

### P2：工程质量与可维护性

1. 抽象统一 IPC mock 工厂
   - 范围：`apps/web/__tests__/setup.ts`、`apps/web/__tests__/integration/renderer`。
   - 当前问题：很多测试手写局部 `mockAccomplish`，API 面容易漏。
   - 改造目标：提供共享的 `createMockAccomplishApi()`，带类型默认值和局部 override。
   - 验收标准：集成测试不再重复大块 IPC mock；新增 IPC API 时能通过类型或 lint 暴露遗漏。

2. 抽象 Zustand store 测试 helper
   - 范围：`apps/web/__tests__/integration/renderer/**`。
   - 当前问题：selector-aware `useTaskStore` mock 在多处重复。
   - 改造目标：提供支持 selector 和 `.getState()` 的统一测试 helper。
   - 验收标准：集成测试统一使用该 helper，不再手写不完整 store mock。

3. 拆分过大的 Execution 集成测试
   - 范围：`apps/web/__tests__/integration/renderer/pages/Execution.integration.test.tsx`。
   - 当前问题：单文件覆盖太多场景，失败输出很长，定位成本高。
   - 改造目标：按 rendering、permissions、follow-up、auth pause、escape-key、tool-message 等拆分。
   - 验收标准：每个测试文件 setup 聚焦，失败输出更短、更容易定位。

4. 减少测试对 CSS class 的耦合
   - 范围：SettingsDialog provider 相关测试。
   - 当前问题：部分测试通过 Tailwind class 判断 active 状态。
   - 改造目标：给 UI 增加语义属性，例如 `aria-current`、`data-active` 或明确 accessible label。
   - 验收标准：active provider 测试使用语义断言，不依赖具体 class 字符串。

5. 明确 preload 兼容策略
   - 范围：`apps/desktop/src/preload/index.ts`、`apps/web/src/client/lib/accomplish.ts`。
   - 当前问题：renderer 局部做了旧 API fallback，但兼容策略没有集中化。
   - 改造目标：在 wrapper 层定义 optional API 和 fallback 行为。
   - 验收标准：组件尽量调用 wrapper，而不是每个组件自己做 feature detection。

### P3：UI、产品打磨与性能

1. 核心页面 loading/error/empty state 复查
   - 范围：Home、Execution、History、Settings、Sidebar。
   - 当前问题：不同页面的加载、错误、空状态反馈不统一。
   - 改造目标：统一 loading、empty、error、retry 模式。
   - 验收标准：核心页面都有 loading/error/empty 状态截图或测试覆盖。

2. 改善首次使用和无 provider 引导
   - 范围：Home、SettingsDialog providers tab、onboarding 状态。
   - 当前问题：用户提交任务后打开设置页时，可能不清楚为什么要配置 provider 或该选哪个。
   - 改造目标：增强 no-provider 文案、推荐 provider 分组、保存成功反馈。
   - 验收标准：无 provider 流程有明确下一步和保存成功反馈。

3. 降低 web bundle 体积
   - 范围：`apps/web/src/client` 路由和 imports、Vite 配置。
   - 当前问题：构建提示主 chunk 超过 500 kB。
   - 改造目标：对 settings、execution heavy components、markdown/tool views、modal-heavy paths 做 route-level 或组件级拆包。
   - 验收标准：主 chunk 明显降低，Vite chunk warning 被消除或有明确阈值说明。

4. 处理 ineffective dynamic import warning
   - 范围：`apps/web/src/client/stores/taskStore.ts`、`apps/web/src/client/pages/execution/useExecutionEvents.ts`、desktop tracking context imports。
   - 当前问题：某些模块既动态导入又静态导入，无法实际拆包。
   - 改造目标：移除无效动态导入或重构模块边界。
   - 验收标准：构建 warning 数量减少。

5. Settings 视觉一致性整理
   - 范围：`apps/web/src/client/components/settings/**`。
   - 当前问题：providers、connectors、integrations、general settings 的布局和卡片风格不完全一致。
   - 改造目标：统一 panel spacing、card shape、tab layout、disabled/error states。
   - 验收标准：Settings 各 tab 视觉结构一致，有组件级截图或等价检查。

### P4：长期架构与清理

1. 定义 native dependency rebuild 策略
   - 范围：root scripts、`apps/desktop/scripts`、CI workflows。
   - 当前问题：Node ABI 和 Electron ABI rebuild 已在本地分离，但 CI 和文档还需要明确。
   - 改造目标：定义 Node 测试 rebuild 与 Electron 打包 rebuild 的明确命令和触发时机。
   - 验收标准：CI 和 docs 清楚说明两个 rebuild 路径。

2. 补充 renderer/preload IPC contract 架构文档
   - 范围：`docs/architecture.md`、`apps/web/src/client/lib/accomplish.ts`、`apps/desktop/src/preload/index.ts`。
   - 当前问题：新增 IPC API 容易导致测试 mock、旧 preload 或 renderer 兼容问题。
   - 改造目标：记录 IPC contract、optional API 规则、mock 更新 checklist。
   - 验收标准：新增 IPC handler 有明确流程：main handler、preload、web wrapper、test mock、typecheck。

3. 抽象本地 proxy/server 端口分配策略
   - 范围：`packages/agent-core/src/opencode/proxies/*`。
   - 当前问题：Azure Foundry 已支持动态端口，但其他本地 proxy/server 可能还有类似固定端口风险。
   - 改造目标：抽象共享 port allocator，支持默认端口、环境变量、测试随机端口、EADDRINUSE fallback。
   - 验收标准：相关 proxy 测试都使用统一 helper，默认避免固定端口冲突。

4. 处理或文档化 dev-browser MCP direct eval
   - 范围：`packages/agent-core/mcp-tools/dev-browser-mcp`、`packages/agent-core/mcp-tools/dev-browser`。
   - 当前问题：构建阶段出现 direct eval warning。
   - 改造目标：如果 eval 必须存在，则隔离执行边界并文档化；如果不必须，则移除。
   - 验收标准：warning 被消除，或有明确安全说明和测试覆盖。

5. 建立产品级回归 checklist
   - 范围：`docs/`、`ai-context/`、CI scripts。
   - 当前问题：当前 P0 修复是一次性稳定化，需要形成可重复流程。
   - 改造目标：定义启动、构建、typecheck、lint、web tests、desktop smoke、核心流程、settings/provider 流程 checklist。
   - 验收标准：后续通篇检测可以直接按 checklist 执行并记录 pass/fail。

## 建议后续执行顺序

1. P1 daemon UI/status consolidation。
2. P1 Home provider setup/resume state machine。
3. P2 shared mock factories for IPC and Zustand store。
4. P2 split Execution integration test file。
5. P3 bundle and build warning cleanup。
6. P4 CI/docs for native rebuild and IPC contract。
