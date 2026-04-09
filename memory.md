# Accomplish Memory

Last updated: 2026-04-09

## Current branch

- Branch: `codex/smart-messaging-digital-worker`
- Relative to remote: ahead of `origin/codex/smart-messaging-digital-worker` by 2 commits

## Recent completed commits

1. `b76f4179` `feat: bundle qwen3.5 local model runtime`
   - Bundles the Qwen3.5 local runtime into the desktop app flow.
   - Touches desktop packaging, startup, local Hugging Face provider wiring, and related copy.
2. `714f54db` `fix: satisfy desktop local model lint checks`
   - Cleans up lint issues around the local model server lifecycle and resource script.

## Current uncommitted work

Modified files:

- `apps/web/src/client/pages/home/FavoritesSection.tsx`
- `apps/web/src/client/components/layout/Sidebar.tsx`
- `apps/web/src/client/components/layout/WorkspaceSelector.tsx`
- `apps/web/locales/en/home.json`
- `apps/web/locales/en/sidebar.json`
- `apps/web/locales/zh-CN/home.json`
- `apps/web/locales/zh-CN/sidebar.json`

### What these changes are doing

- Home page `FavoritesSection` is being repositioned as an `Application Center`.
- Empty state has been redesigned into three business app cards:
  - Message Insight Auditor / 阅信智核官
  - Product Design Officer / 产品智绘官
  - SMS Labeling Officer / 短信智标官
- When favorites exist, favorite cards are also restyled to look like launchable app tiles.
- New i18n copy was added for:
  - `favorites.description`
  - app labels and descriptions under `favorites.apps.*`
  - `favorites.cardType`
  - `favorites.launch`
  - `favorites.businessTag`
  - `favorites.comingSoon`
- Workspace selector now uses translated fallback strings instead of hardcoded English:
  - `sidebar.workspace.default`
  - `sidebar.workspace.manage`
- Sidebar settings button was enlarged significantly (`h-14 w-14`, icon `h-10 w-10`).

## Current product direction implied by the worktree

- The UI is being adapted from a generic assistant homepage toward a verticalized business-app launcher experience.
- The target audience appears to be Chinese business workflows centered on message review, product content/design support, and SMS labeling.
- Branding/copy is currently mixed between English and Chinese depending on locale files and existing sidebar footer content.

## Restart status

- On 2026-04-09, the local app/dev environment was restarted from this repo.
- `pnpm dev:kill` cleared the stale port 5173 process.
- Electron was re-activated and a visible Electron window is currently present.

## Things to verify next

1. Confirm the desktop window is rendering the intended build and not a stale renderer process.
2. Check the home page visually for spacing and responsive behavior of the new `Application Center` cards.
3. Revisit whether existing favorites should still behave like task shortcuts or should become a dedicated app-launcher concept.
4. Validate the enlarged sidebar settings button against the rest of the layout.
5. Run repo-required verification before committing:
   - `pnpm typecheck`
   - `pnpm lint:eslint`
   - `pnpm format:check`
   - likely also `pnpm -F @accomplish/web test` because all current edits are in web UI

## Notes

- No `memory.md` existed in the repo before this file was created.
- Verification commands were not run as part of this pass.
