# P0 Fixes and Follow-up Backlog

Date: 2026-05-08

This note records the P0 fixes completed in the current working tree and the follow-up P1-P4 work that should be handled after the P0 stabilization pass.

## Completed P0 Fixes

### P0.1 Node ABI mismatch for `better-sqlite3`

Problem:

- `packages/agent-core` tests failed because `better-sqlite3` had been rebuilt for Electron ABI `NODE_MODULE_VERSION 145`, while local Node v22.17.0 needs ABI `127`.
- Failure surfaced as native module load errors in storage, skills, and favorites tests.

Changed files:

- `scripts/ensure-node-native-modules.cjs`
- `packages/agent-core/package.json`

What changed:

- Added a pretest native dependency guard script.
- The script validates that `better-sqlite3` can open an in-memory database under the current Node runtime.
- On ABI/native-load failure, it removes the stale native build output and rebuilds `better-sqlite3` for Node tests.
- Wired the script into `@accomplish_ai/agent-core` via `pretest`.

Result:

- `pnpm -F @accomplish_ai/agent-core test` now passes.

Follow-up caution:

- Desktop/Electron still needs Electron-targeted native rebuild before packaging/dev Electron runs. Keep Node test rebuild and Electron rebuild as separate flows.

### P0.2 Web integration test failures

Problem:

- `pnpm -F @accomplish/web test` had many integration failures.
- Main causes were stale IPC mocks, Zustand selector mock mismatch, outdated UI assertions, and current UI behavior not covered by tests.

Changed files:

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

What changed:

- Expanded test IPC mocks for current `window.accomplish` API surface.
- Added `useAccomplish` and `getBuildCapabilities` to relevant test mocks.
- Updated task store mocks so `useTaskStore(selector)` applies the selector instead of returning the whole mock state.
- Updated SettingsDialog assertions to use current design tokens, such as `bg-provider-bg-active`.
- Updated Home provider-save flow mock so saving an API key actually changes provider readiness.
- Updated Execution page permission and Slack auth tests to match current UI and async loading behavior.

Result:

- `pnpm -F @accomplish/web test:integration` now passes: 12 files, 385 tests.
- `pnpm -F @accomplish/web test` now passes: 285 unit tests and 385 integration tests.

### P0.3 Slash command API compatibility

Problem:

- `apps/web/src/client/hooks/useSlashCommand.ts` assumed `getEnabledSkills` always exists.
- Older/mocked API surfaces without `getEnabledSkills` caused repeated `getEnabledSkills is not a function` logs and test instability.

Changed files:

- `apps/web/src/client/hooks/useSlashCommand.ts`
- `apps/web/__tests__/setup.ts`
- `apps/web/__tests__/integration/renderer/components/TaskInputBar.integration.test.tsx`

What changed:

- `useSlashCommand` now prefers `getEnabledSkills`.
- If only older `getSkills` exists, it falls back to `getSkills().filter(skill => skill.isEnabled)`.
- If neither API exists, it silently returns the cached skills list instead of logging an avoidable error.
- Test mocks now include `getEnabledSkills`.

Result:

- Slash command integration tests pass.
- Missing API no longer floods stderr in mock/old-preload environments.

### P0.4 Azure Foundry proxy fixed port conflict

Problem:

- `packages/agent-core/src/opencode/proxies/azure-foundry-proxy.ts` hard-coded port `9228`.
- Multiple app instances or tests could fail with `Port 9228 is already in use`.

Changed files:

- `packages/agent-core/src/opencode/proxies/azure-foundry-proxy.ts`
- `packages/agent-core/tests/unit/opencode/proxies/azure-foundry-proxy.test.ts`

What changed:

- Kept default production port at `9228`.
- Added `ACCOMPLISH_AZURE_FOUNDRY_PROXY_PORT`.
- Supports `0` for random OS-assigned test port.
- Tracks active listening port instead of assuming the requested port.
- Falls back to a random port if the requested non-zero port is occupied.
- Tests now use random ports and assert active proxy URL/port behavior.

Result:

- Azure Foundry proxy tests no longer conflict with existing app/dev listeners.
- Default port remains stable for production behavior.

### P0.5 Related runtime/test stability fixes

Changed files:

- `apps/web/src/client/stores/daemonStore.ts`
- `apps/web/src/client/pages/execution/useExecutionEvents.ts`
- `apps/web/src/client/stores/task-subscriptions.ts`
- `apps/web/src/client/components/landing/TaskInputToolbar.tsx`
- `apps/web/src/client/components/execution/MessageTaskAction.tsx`
- `apps/web/src/client/pages/execution/useExecutionPauseActions.ts`
- `apps/web/src/client/components/settings/ProviderGrid.tsx`
- `apps/web/src/client/components/TaskLauncher/TaskLauncher.tsx`
- `apps/web/src/client/components/TaskLauncher/TaskLauncherContent.tsx`

What changed:

- Daemon event subscriptions now tolerate older/mocked preload APIs with optional event registration.
- `daemonPing` absence no longer crashes module initialization.
- Running/loading task input keeps the Stop button enabled.
- Execution Slack auth action button now has `type="button"` and a stable `data-testid`.
- Execution task action callback now evaluates latest `isConnectorAuthPause` state at click time.
- `ProviderGrid` tolerates older APIs without `getBuildCapabilities`.
- TaskLauncher close behavior no longer double-invokes close through both Radix close and explicit handler.

## Verification Completed

Commands run successfully:

- `pnpm -F @accomplish_ai/agent-core test`
- `pnpm -F @accomplish/web test:integration`
- `pnpm -F @accomplish/web test`
- `pnpm typecheck`
- `pnpm lint:eslint`
- `pnpm format:check`
- `pnpm build`

Known warnings left:

- `pnpm lint:eslint` passes with existing React hook warnings in:
  - `apps/web/src/client/components/settings/DaemonSection.tsx`
  - `apps/web/src/client/components/settings/integrations/useWhatsAppCard.ts`
  - `apps/web/src/client/components/settings/integrations/useWhatsAppSubscriptions.ts`
  - `apps/web/src/client/components/settings/useKnowledgeNotes.ts`
  - `apps/web/src/client/hooks/useTaskInputBehavior.ts`
- `pnpm build` passes with existing Vite/esbuild warnings about large chunks, ineffective dynamic imports, deprecated inline dynamic imports, and direct eval in dev-browser MCP tooling.

## Follow-up Backlog

### P1: Product-critical UX and reliability

1. Normalize daemon UI states.
   - Range: `apps/web/src/client/stores/daemonStore.ts`, `apps/web/src/client/components/settings/DaemonSection.tsx`, `apps/web/src/client/components/layout/DaemonConnectionToast.tsx`, execution reconnect handling.
   - Problem: daemon status assumptions are split across store, toast, settings, and execution page.
   - Target: one status model with consistent `connected`, `stopped`, `reconnecting`, `reconnect-failed`, and retry behavior.
   - Acceptance: daemon stop/restart/reconnect flows have deterministic UI states and integration coverage.

2. Harden Home submit and provider setup flow.
   - Range: `apps/web/src/client/pages/home/useHomePage.ts`, `apps/web/src/client/pages/home/useHomePageSettings.ts`, SettingsDialog provider save flow.
   - Problem: provider readiness and resume-after-settings are easy to regress and mostly protected by mocks.
   - Target: explicit state machine for `submit -> provider check -> settings -> resume`.
   - Acceptance: real component integration tests cover no-provider, provider-saved, cancelled-settings, and E2E mode.

3. Improve task interruption feedback.
   - Range: `apps/web/src/client/components/landing/TaskInputToolbar.tsx`, `apps/web/src/client/pages/Execution.tsx`, `apps/web/src/client/stores/taskStore.ts`.
   - Problem: Stop button is now enabled, but user feedback during interrupt is still minimal.
   - Target: show interrupt pending/failed/succeeded states.
   - Acceptance: Stop button has loading/disabled state during interrupt request and error fallback.

4. Stabilize OAuth connector resume flow.
   - Range: `apps/web/src/client/pages/execution/useExecutionPauseActions.ts`, `apps/web/src/client/components/settings/connectors/*`, Slack MCP IPC handlers.
   - Problem: Slack auth resume relies on several async checks and can be affected by SettingsDialog prefetches.
   - Target: isolate connector auth action state from settings prefetch state.
   - Acceptance: execution-page Slack auth resume works whether SettingsDialog is mounted, closed, or loading in background.

5. Add browser-level smoke checks for desktop dev startup.
   - Range: `apps/desktop/e2e`, `apps/web` routes.
   - Problem: unit/integration tests pass, but desktop renderer/preload integration can still drift.
   - Target: minimal Electron smoke for initial render, daemon ping, task input, settings open.
   - Acceptance: `pnpm -F @accomplish/desktop test:e2e:native:fast` covers local dev boot without manual inspection.

### P2: Engineering quality and maintainability

1. Centralize test IPC mock factory.
   - Range: `apps/web/__tests__/setup.ts`, integration tests under `apps/web/__tests__/integration/renderer`.
   - Problem: many tests define partial `mockAccomplish` objects manually.
   - Target: shared `createMockAccomplishApi()` with typed defaults and per-test overrides.
   - Acceptance: no repeated large IPC mock blocks in integration tests; missing API additions fail type/lint checks.

2. Centralize Zustand test store mock helper.
   - Range: `apps/web/__tests__/integration/renderer/**`.
   - Problem: selector-aware `useTaskStore` mock is repeated.
   - Target: helper that supports selector usage and `.getState()`.
   - Acceptance: tests import a single helper for task store mocks.

3. Split oversized Execution page tests.
   - Range: `apps/web/__tests__/integration/renderer/pages/Execution.integration.test.tsx`.
   - Problem: one file has many unrelated flows and is expensive to debug.
   - Target: split into rendering, permissions, follow-up, auth pause, escape-key, and tool-message suites.
   - Acceptance: each file has focused setup and failure output.

4. Remove test coupling to CSS implementation details where possible.
   - Range: SettingsDialog and provider tests.
   - Problem: tests check class names for active states.
   - Target: add semantic attributes such as `aria-current`, `data-active`, or accessible labels.
   - Acceptance: active provider tests use semantics instead of Tailwind class strings.

5. Make preload compatibility explicit.
   - Range: `apps/desktop/src/preload/index.ts`, `apps/web/src/client/lib/accomplish.ts`.
   - Problem: renderer now has fallbacks for older/mocked APIs, but compatibility policy is implicit.
   - Target: document optional APIs and provide wrapper methods for fallback behavior.
   - Acceptance: renderer components use wrapper-level compatibility, not local feature detection everywhere.

### P3: UI, product polish, and performance

1. Build a loading/error/empty-state audit for core pages.
   - Range: Home, Execution, History, Settings, Sidebar.
   - Problem: core flows have uneven loading and error feedback.
   - Target: shared patterns for loading indicators, empty states, retry affordances, and inline errors.
   - Acceptance: page-level screenshots and tests cover loading/error/empty states.

2. Improve first-run and no-provider guidance.
   - Range: Home, SettingsDialog providers tab, onboarding state.
   - Problem: user may not know why task submission opens settings or what provider to choose.
   - Target: clearer no-provider copy, recommended provider grouping, and saved-provider confirmation.
   - Acceptance: no-provider flow has obvious next action and visible success feedback.

3. Reduce web bundle size.
   - Range: `apps/web/src/client` routing/imports, Vite config.
   - Problem: build warns that main chunk is larger than 500 kB.
   - Target: route-level code splitting for settings, execution heavy components, markdown/tool views, and modal-heavy paths.
   - Acceptance: main chunk significantly reduced and Vite chunk warning either removed or justified.

4. Resolve ineffective dynamic import warnings.
   - Range: `apps/web/src/client/stores/taskStore.ts`, `apps/web/src/client/pages/execution/useExecutionEvents.ts`, desktop tracking context imports.
   - Problem: dynamic imports do not split because modules are also statically imported.
   - Target: either remove ineffective dynamic imports or refactor boundaries.
   - Acceptance: build warning count is reduced.

5. Visual consistency pass for Settings.
   - Range: `apps/web/src/client/components/settings/**`.
   - Problem: providers, connectors, integrations, and general settings use mixed patterns.
   - Target: consistent panel spacing, card shape, tab layout, disabled/error states.
   - Acceptance: Settings tabs visually align and have component-level screenshots or Storybook-equivalent examples if available.

### P4: Long-term architecture and cleanup

1. Define native dependency rebuild strategy.
   - Range: root scripts, `apps/desktop/scripts`, CI workflows.
   - Problem: Node ABI and Electron ABI rebuild needs are now separated locally but should be CI/documentation-backed.
   - Target: explicit commands for Node test rebuild and Electron package rebuild.
   - Acceptance: CI and docs describe when each rebuild path runs.

2. Add architecture docs for renderer/preload IPC contract.
   - Range: `docs/architecture.md`, `apps/web/src/client/lib/accomplish.ts`, `apps/desktop/src/preload/index.ts`.
   - Problem: API additions can break tests or older renderer/preload combinations.
   - Target: versioned IPC contract notes and compatibility rules.
   - Acceptance: adding IPC methods has a documented checklist and a test helper update step.

3. Move proxy port allocation policy into shared infrastructure.
   - Range: `packages/agent-core/src/opencode/proxies/*`.
   - Problem: Azure Foundry now has robust dynamic port behavior, but other local proxy/server features may need the same pattern.
   - Target: shared port allocator/helper with env override, default port, random test port, and EADDRINUSE fallback.
   - Acceptance: proxy tests use the same helper and avoid fixed ports by default.

4. Reduce direct eval or isolate bundler warnings in dev browser MCP.
   - Range: `packages/agent-core/mcp-tools/dev-browser-mcp`, `packages/agent-core/mcp-tools/dev-browser`.
   - Problem: build emits direct eval warnings.
   - Target: document why eval is required or isolate it behind a safer execution boundary.
   - Acceptance: warning is eliminated or intentionally documented with a test.

5. Establish product-level regression checklist.
   - Range: `docs/`, `ai-context/`, CI scripts.
   - Problem: current pass fixed P0s, but product review findings need a repeatable checklist.
   - Target: checklist covering startup, build, typecheck, lint, web tests, desktop smoke, core user flows, and settings/provider flows.
   - Acceptance: future audit can run the checklist and compare pass/fail status.

## Suggested Next Execution Order

1. P1 daemon UI/status consolidation.
2. P1 Home provider setup/resume state machine.
3. P2 shared mock factories for IPC and Zustand store.
4. P2 split Execution integration test file.
5. P3 bundle and build warning cleanup.
6. P4 CI/docs for native rebuild and IPC contract.
