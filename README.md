<p align="center">
  <strong>English</strong> | <a href="README.zh-CN.md">中文</a> | <a href="README.ja.md">日本語</a> | <a href="README.ko.md">한국어</a> | <a href="README.ru.md">Русский</a> | <a href="README.es.md">Español</a> | <a href="README.tr.md">Türkçe</a> | <a href="README.ar.md">العربية</a> | <a href="README.id.md">Bahasa Indonesia</a> | <a href="README.ta.md">தமிழ்</a> | <a href="README.hi.md">हिन्दी</a>
</p>

<p align="center">
  <img src="docs/banner.svg" alt="Accomplish - Open source AI desktop agent that automates file management, document creation, and browser tasks with your own AI API keys" width="100%" />
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-22c55e?style=flat-square" alt="MIT License" /></a>
  <a href="https://github.com/accomplish-ai/accomplish/stargazers"><img src="https://img.shields.io/github/stars/accomplish-ai/accomplish?style=flat-square&color=22c55e" alt="GitHub Stars" /></a>
  <a href="https://github.com/accomplish-ai/accomplish/issues"><img src="https://img.shields.io/github/issues/accomplish-ai/accomplish?style=flat-square&color=22c55e" alt="GitHub Issues" /></a>
  <a href="https://github.com/accomplish-ai/accomplish/commits"><img src="https://img.shields.io/github/last-commit/accomplish-ai/accomplish?style=flat-square&color=22c55e" alt="Last Commit" /></a>
  <a href="https://downloads.accomplish.ai/downloads/0.4.13/macos/Accomplish-0.4.13-mac-arm64.dmg"><img src="https://img.shields.io/badge/Download-macOS_(Apple_Silicon)-0ea5e9?style=flat-square" alt="Download for macOS (Apple Silicon)" /></a>
  <a href="https://downloads.accomplish.ai/downloads/0.4.13/macos/Accomplish-0.4.13-mac-x64.dmg"><img src="https://img.shields.io/badge/Download-macOS_(Intel)-0ea5e9?style=flat-square" alt="Download for macOS (Intel)" /></a>
  <a href="https://downloads.accomplish.ai/downloads/0.4.13/windows/Accomplish-0.4.13-win-x64.exe"><img src="https://img.shields.io/badge/Download-Windows_11-0ea5e9?style=flat-square" alt="Download for Windows 11" /></a>
  <a href="https://downloads.accomplish.ai/downloads/0.4.13/linux/Accomplish-0.4.13-linux-arm64.AppImage"><img src="https://img.shields.io/badge/Download-Linux_(ARM64)-0ea5e9?style=flat-square" alt="Download for Linux (ARM64)" /></a>
  <a href="https://downloads.accomplish.ai/downloads/0.4.13/linux/Accomplish-0.4.13-linux-x86_64.AppImage"><img src="https://img.shields.io/badge/Download-Linux_(x64)-0ea5e9?style=flat-square" alt="Download for Linux (x64)" /></a>
  <a href="https://downloads.accomplish.ai/downloads/0.4.13/linux/Accomplish-0.4.13-linux-amd64.deb"><img src="https://img.shields.io/badge/Download-Linux_(.deb_x64)-0ea5e9?style=flat-square" alt="Download for Linux (.deb x64)" /></a>
  <a href="https://discord.gg/kg5Nekpm"><img src="https://img.shields.io/badge/Discord-Join-5865F2?style=flat-square&logo=discord&logoColor=white" alt="Discord" /></a>
</p>

# Accomplish™ - Open Source AI Agent Client

Accomplish is an open source AI agent client designed to run on each user's own computer. It is built to do real work, not just chat: task execution, content generation, browser workflows, message handling, document processing, and business-oriented automation all run through a local desktop experience.

By default, Accomplish ships with the local `Qwen3.5-0.8B` runtime so a new machine can start with a built-in model baseline. On top of that, it can connect to frontier hosted models and local model stacks, so teams can choose the right balance of cost, privacy, speed, and capability.

<p align="center">
  <strong>Runs locally on your machine. Built for action-oriented AI work. Open source and MIT licensed.</strong>
</p>

<p align="center">
  <a href="https://downloads.accomplish.ai/downloads/0.4.13/macos/Accomplish-0.4.13-mac-arm64.dmg"><strong>Download for Mac (Apple Silicon)</strong></a>
  ·
  <a href="https://downloads.accomplish.ai/downloads/0.4.13/macos/Accomplish-0.4.13-mac-x64.dmg"><strong>Download for Mac (Intel)</strong></a>
  ·
  <a href="https://downloads.accomplish.ai/downloads/0.4.13/windows/Accomplish-0.4.13-win-x64.exe"><strong>Download for Windows 11</strong></a>
  ·
  <a href="https://downloads.accomplish.ai/downloads/0.4.13/linux/Accomplish-0.4.13-linux-arm64.AppImage"><strong>Download for Linux (ARM64)</strong></a>
  ·
  <a href="https://downloads.accomplish.ai/downloads/0.4.13/linux/Accomplish-0.4.13-linux-x86_64.AppImage"><strong>Download for Linux (x64)</strong></a>
  ·
  <a href="https://downloads.accomplish.ai/downloads/0.4.13/linux/Accomplish-0.4.13-linux-amd64.deb"><strong>Download for Linux (.deb x64)</strong></a>
  ·
  <a href="https://www.accomplish.ai/">Accomplish website</a>
  ·
  <a href="https://www.accomplish.ai/blog/">Accomplish blog</a>
  ·
  <a href="https://github.com/accomplish-ai/accomplish/releases">Accomplish releases</a>
</p>

<br />

---

<br />

## Product direction

Accomplish is being shaped into a practical agent operating layer for everyday work on personal computers:

- It runs on each person's own desktop instead of inside a centralized browser-only product.
- It is designed to execute work, not only answer questions.
- It starts with a bundled local model and can scale up to stronger external providers when needed.
- It exposes a business-oriented Application Center for domain-specific workflows.
- It stays extensible because the foundation is open source and provider-agnostic.

In practice, that means Accomplish is aiming to become a local AI work client that combines:

- conversational assistance
- task planning and execution
- structured content generation
- browser and file operations
- business workflow apps
- provider flexibility for both local and cloud models

<br />

---

<br />

## What makes it different

<table>
<tr>
<td width="50%" valign="top" align="center">

### 🖥️ Local-first desktop client

<div align="left">

- Runs directly on the user's computer
- Files, local state, and permissions stay close to the machine
- The desktop shell can coordinate local tools, storage, and execution safely

</div>

</td>
<td width="50%" valign="top" align="center">

### 🤖 Action-oriented agent

<div align="left">

- Handles conversations, task execution, structured workflows, and follow-up actions
- Can work across documents, local files, browser tasks, and business processes
- Built for "do the work" scenarios rather than pure chat

</div>

</td>
</tr>
<tr>
<td width="50%" valign="top" align="center">

### 🧩 Business Application Center

<div align="left">

- Includes an Application Center for workflow-specific agent experiences
- Current direction includes business apps such as message auditing, product design support, and SMS labeling
- Designed for stronger scripting, orchestration, and repeatable domain workflows

</div>

</td>
<td width="50%" valign="top" align="center">

### 🔌 Open foundation, flexible models

<div align="left">

- Open source codebase under MIT
- Supports bundled local runtime plus external providers
- Can connect to OpenAI, Anthropic, Google, xAI, DeepSeek, Moonshot, Z.AI, OpenRouter, Ollama, LM Studio, Bedrock, Azure Foundry, LiteLLM, and more

</div>

</td>
</tr>
</table>

<br />

---

<br />

## What it can do

|                                                                                                        |                                                                                          |                                                                              |
| :----------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------- |
| **💬 Conversation and Planning**                                                                       | **✍️ Content and Document Work**                                                         | **🌐 Browser and Web Tasks**                                                 |
| Chat with the agent, break work into steps, continue interrupted tasks, and drive multi-step execution | Draft, summarize, rewrite, and structure documents, reports, notes, and business content | Research, navigate, and complete browser-based workflows with agent control  |
|                                                                                                        |                                                                                          |                                                                              |
| **📁 Local Files and Desktop Work**                                                                    | **🏢 Business Apps**                                                                     | **🔗 Tool and Provider Connections**                                         |
| Work with local folders, files, and machine-level context through a desktop runtime                    | Launch focused workflows from the Application Center for domain-specific business tasks  | Connect to local and cloud model providers, plus external tools and services |

<br />

## Application Center direction

The home screen is evolving toward an Application Center instead of a generic "favorites" area. The goal is to package agent capabilities into focused business apps that are easier to adopt inside real workflows.

Examples of the current direction:

- Message Insight Auditor: for message review, content verification, and risk detection
- Product Design Officer: for product concept design, content structuring, and generation
- SMS Labeling Officer: for labeling, classification, and rule-driven messaging workflows

This layer is intended to provide stronger workflow guidance, better orchestration, and more repeatable outcomes than a blank chat box alone.

<br />

## Architecture

Accomplish uses a split desktop architecture so the product can feel like a modern client while still having direct access to local execution:

- `apps/web`: the React UI, routing, state management, and user-facing screens
- `apps/desktop`: the Electron shell, preload bridge, local OS integration, and secure desktop packaging
- `apps/daemon`: the background task daemon responsible for resilient task execution and scheduling
- `packages/agent-core`: the shared core business logic, task lifecycle, storage, types, and MCP tooling

This structure makes it possible to combine:

- a fast renderer/UI layer
- a thin desktop host
- a long-running local execution process
- shared agent logic reused across surfaces

<br />

## Use cases

- Clean up messy folders by project, file type, or date
- Draft, summarize, and rewrite docs, reports, and meeting notes
- Automate browser workflows like research, auditing, and form entry
- Generate weekly updates from files and notes
- Prepare meeting materials from docs and calendars
- Review messages or SMS content in business-specific agent flows

<br />

## Supported models and providers

- Bundled local runtime: `Qwen3.5-0.8B`
- Anthropic (Claude)
- OpenAI (GPT)
- Google AI (Gemini)
- xAI (Grok)
- DeepSeek
- Moonshot AI (Kimi)
- Z.AI (GLM)
- MiniMax
- Venice.ai
- Amazon Bedrock
- Azure Foundry
- OpenRouter
- LiteLLM
- Ollama (local models)
- LM Studio (local models)

<br />

## Privacy and local-first

Accomplish runs locally on your machine. Your files stay on your device, and you choose which folders it can access. The desktop shell, daemon, and local model/runtime path are designed so the product can be useful even before wiring in external services, while still allowing stronger hosted providers when needed.

<br />

## System requirements

- macOS (Apple Silicon)
- macOS (Intel)
- Windows 11
- Ubuntu (ARM64)
- Ubuntu (x64)

<br />

---

<br />

## How to use it

> **Takes 2 minutes to set up.**

| Step  | Action              | Details                                                                                                           |
| :---: | ------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **1** | **Install the App** | Download the DMG and drag it into Applications                                                                    |
| **2** | **Connect Your AI** | Use your own Google, OpenAI, Anthropic (or other) API key — or sign in with ChatGPT (Plus/Pro). No subscriptions. |
| **3** | **Give It Access**  | Choose which folders it can see. You stay in control.                                                             |
| **4** | **Start Working**   | Ask it to summarize a doc, clean a folder, or create a report. You approve everything.                            |

<br />

<br />

<div align="center">

[**Download for Mac (Apple Silicon)**](https://downloads.accomplish.ai/downloads/0.4.13/macos/Accomplish-0.4.13-mac-arm64.dmg) · [**Download for Mac (Intel)**](https://downloads.accomplish.ai/downloads/0.4.13/macos/Accomplish-0.4.13-mac-x64.dmg) · [**Download for Windows 11**](https://downloads.accomplish.ai/downloads/0.4.13/windows/Accomplish-0.4.13-win-x64.exe) · [**Download for Linux (ARM64)**](https://downloads.accomplish.ai/downloads/0.4.13/linux/Accomplish-0.4.13-linux-arm64.AppImage) · [**Download for Linux (x64)**](https://downloads.accomplish.ai/downloads/0.4.13/linux/Accomplish-0.4.13-linux-x86_64.AppImage) · [**Download for Linux (.deb x64)**](https://downloads.accomplish.ai/downloads/0.4.13/linux/Accomplish-0.4.13-linux-amd64.deb)

</div>

<br />

---

<br />

## Screenshots and Demo

A quick look at Accomplish on macOS, plus a short demo video.

<p align="center">
  <a href="https://youtu.be/UJ0FIufMOlc?si=iFcu3VTG4B4q9VCB">
    <img src="docs/video-thumbnail.png" alt="Accomplish demo - AI agent automating file management and browser tasks" width="600" />
  </a>
</p>

<p align="center">
  <a href="https://youtu.be/UJ0FIufMOlc?si=iFcu3VTG4B4q9VCB">Watch the demo →</a>
</p>

<br />

## FAQ

**Does Accomplish run locally?**  
Yes. Accomplish runs locally on your machine and you control which folders it can access.

**Do I need an API key?**  
You can use your own API keys (OpenAI, Anthropic, Google, xAI, etc.) or run local models via Ollama.

**Is Accomplish free?**  
Yes. Accomplish is open source and MIT licensed.

**Which platforms are supported?**
macOS (Apple Silicon), macOS (Intel), Windows 11, Ubuntu ARM64, and Ubuntu x64 are supported.

<br />

---

<br />

## Development

```bash
pnpm install
pnpm dev
```

That's it.

<details>
<summary><strong>Prerequisites</strong></summary>

- Node.js 20+
- pnpm 9+

</details>

<details>
<summary><strong>All Commands</strong></summary>

| Command                                     | Description                            |
| ------------------------------------------- | -------------------------------------- |
| `pnpm dev`                                  | Run desktop app in dev mode            |
| `pnpm dev:clean`                            | Dev mode with clean start              |
| `pnpm build`                                | Build all workspaces                   |
| `pnpm build:desktop`                        | Build desktop app only                 |
| `pnpm -F @accomplish/desktop package:win`   | Build Windows installer (x64)          |
| `pnpm -F @accomplish/desktop package:linux` | Build Linux artifacts (AppImage + deb) |
| `pnpm lint`                                 | TypeScript checks                      |
| `pnpm typecheck`                            | Type validation                        |
| `pnpm -F @accomplish/desktop test:e2e`      | Playwright E2E tests                   |

</details>

<details>
<summary><strong>Environment Variables</strong></summary>

| Variable          | Description                        |
| ----------------- | ---------------------------------- |
| `CLEAN_START=1`   | Clear all stored data on app start |
| `E2E_SKIP_AUTH=1` | Skip onboarding flow (for testing) |

</details>

<details>
<summary><strong>Architecture</strong></summary>

```
apps/
  desktop/        # Electron app (main + preload + renderer)
packages/
  shared/         # Shared TypeScript types
```

The desktop app uses Electron with a React UI bundled via Vite. The main process spawns [OpenCode](https://github.com/sst/opencode) CLI using `node-pty` to execute tasks. API keys are stored securely in the OS keychain.

See [CLAUDE.md](CLAUDE.md) for detailed architecture documentation.

</details>

<br />

---

<br />

## Contributing

Contributions welcome! Feel free to open a PR.

```bash
# Fork → Clone → Branch → Commit → Push → PR
git checkout -b feature/amazing-feature
git commit -m 'Add amazing feature'
git push origin feature/amazing-feature
```

<br />

---

<br />

<div align="center">

**[Accomplish website](https://www.accomplish.ai/)** · **[Accomplish blog](https://www.accomplish.ai/blog/)** · **[Accomplish releases](https://github.com/accomplish-ai/accomplish/releases)** · **[Issues](https://github.com/accomplish-ai/accomplish/issues)** · **[Twitter](https://x.com/Accomplish_ai)**

<br />

MIT License · Built by [Accomplish](https://www.accomplish.ai)

<br />

**Keywords:** AI agent, AI desktop agent, desktop automation, file management, document creation, browser automation, local-first, macOS, linux, ubuntu, privacy-first, open source, Electron, computer use, AI assistant, workflow automation, OpenAI, Anthropic, Google, xAI, Claude, GPT-4, Ollama

</div>
