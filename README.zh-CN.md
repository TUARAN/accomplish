<p align="center">
  <a href="README.md">English</a> | <strong>中文</strong> | <a href="README.ja.md">日本語</a> | <a href="README.ko.md">한국어</a> | <a href="README.ru.md">Русский</a> | <a href="README.es.md">Español</a> | <a href="README.tr.md">Türkçe</a> | <a href="README.ar.md">العربية</a> | <a href="README.id.md">Bahasa Indonesia</a> | <a href="README.ta.md">தமிழ்</a> | <a href="README.hi.md">हिन्दी</a>
</p>

<p align="center">
  <img src="docs/banner.svg" alt="Accomplish - 开源 AI 桌面代理，使用您自己的 AI API 密钥自动化文件管理、文档创建和浏览器任务" width="100%" />
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-22c55e?style=flat-square" alt="MIT 许可证" /></a>
  <a href="https://github.com/accomplish-ai/accomplish/stargazers"><img src="https://img.shields.io/github/stars/accomplish-ai/accomplish?style=flat-square&color=22c55e" alt="GitHub Stars" /></a>
  <a href="https://github.com/accomplish-ai/accomplish/issues"><img src="https://img.shields.io/github/issues/accomplish-ai/accomplish?style=flat-square&color=22c55e" alt="GitHub Issues" /></a>
  <a href="https://github.com/accomplish-ai/accomplish/commits"><img src="https://img.shields.io/github/last-commit/accomplish-ai/accomplish?style=flat-square&color=22c55e" alt="最近提交" /></a>
  <a href="https://downloads.accomplish.ai/downloads/0.4.13/macos/Accomplish-0.4.13-mac-arm64.dmg"><img src="https://img.shields.io/badge/Download-macOS_(Apple_Silicon)-0ea5e9?style=flat-square" alt="下载 macOS 版 (Apple Silicon)" /></a>
  <a href="https://downloads.accomplish.ai/downloads/0.4.13/macos/Accomplish-0.4.13-mac-x64.dmg"><img src="https://img.shields.io/badge/Download-macOS_(Intel)-0ea5e9?style=flat-square" alt="下载 macOS 版 (Intel)" /></a>
  <a href="https://downloads.accomplish.ai/downloads/0.4.13/windows/Accomplish-0.4.13-win-x64.exe"><img src="https://img.shields.io/badge/Download-Windows_11-0ea5e9?style=flat-square" alt="下载 Windows 11 版" /></a>
  <a href="https://downloads.accomplish.ai/downloads/0.4.13/linux/Accomplish-0.4.13-linux-arm64.AppImage"><img src="https://img.shields.io/badge/Download-Linux_(ARM64)-0ea5e9?style=flat-square" alt="下载 Linux 版（ARM64）" /></a>
  <a href="https://downloads.accomplish.ai/downloads/0.4.13/linux/Accomplish-0.4.13-linux-x86_64.AppImage"><img src="https://img.shields.io/badge/Download-Linux_(x64)-0ea5e9?style=flat-square" alt="下载 Linux 版（x64）" /></a>
  <a href="https://downloads.accomplish.ai/downloads/0.4.13/linux/Accomplish-0.4.13-linux-amd64.deb"><img src="https://img.shields.io/badge/Download-Linux_(.deb_x64)-0ea5e9?style=flat-square" alt="下载 Linux 版 (.deb x64)" /></a>
  <a href="https://discord.gg/kg5Nekpm"><img src="https://img.shields.io/badge/Discord-Join-5865F2?style=flat-square&logo=discord&logoColor=white" alt="Discord" /></a>
</p>

# Accomplish™ - 开源 AI 智能体客户端

Accomplish 是一个开源 AI 智能体客户端，目标是运行在每个人自己的电脑上。它不是单纯的聊天工具，而是一个能实际干活的本地桌面工作端：任务执行、内容生成、浏览器流程、消息处理、文档处理和业务自动化都可以通过本地客户端完成。

默认情况下，Accomplish 搭载本地 `Qwen3.5-0.8B` 运行时，让一台新机器在不开外部服务的前提下也能立即具备基础智能能力。在此基础上，它也支持连接更强的云端模型和本地模型栈，方便团队在成本、隐私、速度和能力之间做取舍。

<p align="center">
  <strong>本地运行，面向执行型 AI 工作，开源且采用 MIT 许可证。</strong>
</p>

<p align="center">
  <a href="https://downloads.accomplish.ai/downloads/0.4.13/macos/Accomplish-0.4.13-mac-arm64.dmg"><strong>下载 Mac 版（Apple Silicon）</strong></a>
  ·
  <a href="https://downloads.accomplish.ai/downloads/0.4.13/macos/Accomplish-0.4.13-mac-x64.dmg"><strong>下载 Mac 版（Intel）</strong></a>
  ·
  <a href="https://downloads.accomplish.ai/downloads/0.4.13/windows/Accomplish-0.4.13-win-x64.exe"><strong>下载 Windows 11 版</strong></a>
  ·
  <a href="https://downloads.accomplish.ai/downloads/0.4.13/linux/Accomplish-0.4.13-linux-arm64.AppImage"><strong>下载 Linux 版（ARM64）</strong></a>
  ·
  <a href="https://downloads.accomplish.ai/downloads/0.4.13/linux/Accomplish-0.4.13-linux-x86_64.AppImage"><strong>下载 Linux 版（x64）</strong></a>
  ·
  <a href="https://downloads.accomplish.ai/downloads/0.4.13/linux/Accomplish-0.4.13-linux-amd64.deb"><strong>下载 Linux 版（.deb x64）</strong></a>
  ·
  <a href="https://www.accomplish.ai/">Accomplish 官网</a>
  ·
  <a href="https://www.accomplish.ai/blog/">Accomplish 博客</a>
  ·
  <a href="https://github.com/accomplish-ai/accomplish/releases">Accomplish 发布版本</a>
</p>

<br />

---

<br />

## 产品方向

Accomplish 正在被打造成一个面向日常工作的本地智能体操作层：

- 运行在每个人自己的桌面上，而不是一个纯浏览器的中心化产品
- 重点是执行工作，而不只是回答问题
- 默认提供内置本地模型，并可按需接入更强的外部模型
- 提供面向业务场景的“应用中心”
- 基于开源底座，保持模型和能力接入的开放性

换句话说，Accomplish 想成为一个本地 AI 工作客户端，把以下能力组合到一起：

- 对话协作
- 任务规划与执行
- 结构化内容生成
- 浏览器与文件操作
- 面向业务流程的应用化能力
- 本地模型与云端模型的灵活切换

<br />

---

<br />

## 有何不同

<table>
<tr>
<td width="50%" valign="top" align="center">

### 🖥️ 本地优先的桌面客户端

<div align="left">

- 直接运行在用户自己的电脑上
- 文件、权限和本地状态都更贴近用户机器
- 桌面壳层可以安全协调本地工具、存储和执行链路

</div>

</td>
<td width="50%" valign="top" align="center">

### 🤖 面向执行的智能体

<div align="left">

- 不只负责对话，还负责任务执行、流程推进和后续动作
- 能覆盖文档、本地文件、浏览器任务和业务流程
- 目标是“把事情做完”，而不是停留在聊天层

</div>

</td>
</tr>
<tr>
<td width="50%" valign="top" align="center">

### 🧩 面向业务的应用中心

<div align="left">

- 首页正在演进为“应用中心”，承载更聚焦的业务应用
- 当前方向包括消息审核、产品设计支持、短信标注等应用
- 强调更强的脚本能力、流程编排能力和可复用工作流

</div>

</td>
<td width="50%" valign="top" align="center">

### 🔌 开放底座与灵活模型

<div align="left">

- 整体代码开源，MIT 许可证
- 同时支持内置本地运行时和外部模型提供商
- 可接入 OpenAI、Anthropic、Google、xAI、DeepSeek、Moonshot、Z.AI、OpenRouter、Ollama、LM Studio、Bedrock、Azure Foundry、LiteLLM 等

</div>

</td>
</tr>
</table>

<br />

---

<br />

## 它能做什么

|                                                    |                                                        |                                              |
| :------------------------------------------------- | :----------------------------------------------------- | :------------------------------------------- |
| **💬 对话与规划**                                  | **✍️ 内容与文档工作**                                  | **🌐 浏览器与网页任务**                      |
| 与智能体对话、拆解步骤、续接中断任务并驱动多步执行 | 起草、总结、改写和结构化组织文档、报告、笔记和业务内容 | 在智能体控制下完成研究、浏览与网页流程执行   |
|                                                    |                                                        |                                              |
| **📁 本地文件与桌面工作**                          | **🏢 业务应用**                                        | **🔗 工具与模型连接**                        |
| 基于桌面运行时访问本地文件夹、文件与机器级上下文   | 从应用中心启动面向具体业务场景的智能体工作流           | 同时接入本地模型、云端模型以及外部工具与服务 |

<br />

## 应用中心方向

首页正在从通用“收藏区”演进为“应用中心”。目标是把智能体能力打包成更容易落地的业务应用，而不是只给用户一个空白聊天框。

当前方向中的例子包括：

- 阅信智核官：用于消息审核、内容核查和风险识别
- 产品智绘官：用于产品方案设计、内容组织和生成
- 短信智标官：用于短信标注、分类和规则编排

这一层的目标是提供更强的工作流引导、更稳定的流程编排能力，以及更可复用的业务产出方式。

<br />

## 架构说明

Accomplish 采用分层桌面架构，让产品既能保持现代客户端体验，又能真正接入本地执行能力：

- `apps/web`：React 前端 UI、路由、状态管理和用户界面
- `apps/desktop`：Electron 桌面壳层、preload 桥接、本地系统集成和桌面打包
- `apps/daemon`：后台守护进程，负责更稳定的任务执行和调度
- `packages/agent-core`：共享核心逻辑，包含任务生命周期、存储、类型定义和 MCP 工具

这套结构把以下几层组合在一起：

- 快速迭代的 UI 渲染层
- 轻量桌面宿主层
- 可持续运行的本地执行进程
- 可复用的共享智能体核心

<br />

## 使用场景

- 按项目、文件类型或日期整理凌乱的文件夹
- 起草、总结和重写文档、报告和会议记录
- 自动化浏览器工作流程，如研究、审核和表单填写
- 从文件和笔记生成每周更新
- 从文档和日历准备会议材料
- 在业务应用中处理消息审核或短信内容工作流

<br />

## 支持的模型和提供商

- 内置本地运行时：`Qwen3.5-0.8B`
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
- Ollama（本地模型）
- LM Studio（本地模型）

<br />

## 隐私和本地优先

Accomplish 在您的机器上本地运行。您的文件保留在您的设备上，您可以自主决定它可以访问哪些文件夹。桌面壳层、守护进程和本地模型运行时这条链路的设计目标，就是让产品在不依赖外部服务时也能先干活；而在需要更强能力时，也能继续接入外部模型。

<br />

## 系统要求

- macOS（Apple Silicon）
- Windows 11
- Ubuntu (ARM64)
- Ubuntu (x64)

<br />

---

<br />

## 如何使用

> **设置只需 2 分钟。**

| 步骤  | 操作             | 详情                                                                                               |
| :---: | ---------------- | -------------------------------------------------------------------------------------------------- |
| **1** | **安装应用**     | 下载 DMG 并将其拖入应用程序文件夹                                                                  |
| **2** | **连接您的 AI**  | 使用您自己的 Google、OpenAI、Anthropic（或其他）API 密钥——或使用 ChatGPT（Plus/Pro）登录。无订阅。 |
| **3** | **授予访问权限** | 选择它可以查看哪些文件夹。您保持控制权。                                                           |
| **4** | **开始工作**     | 让它总结文档、整理文件夹或创建报告。您批准所有操作。                                               |

<br />

<br />

<div align="center">

[**下载 Mac 版（Apple Silicon）**](https://downloads.accomplish.ai/downloads/0.4.13/macos/Accomplish-0.4.13-mac-arm64.dmg) · [**下载 Mac 版（Intel）**](https://downloads.accomplish.ai/downloads/0.4.13/macos/Accomplish-0.4.13-mac-x64.dmg) · [**下载 Windows 11 版**](https://downloads.accomplish.ai/downloads/0.4.13/windows/Accomplish-0.4.13-win-x64.exe) · [**下载 Linux 版（ARM64）**](https://downloads.accomplish.ai/downloads/0.4.13/linux/Accomplish-0.4.13-linux-arm64.AppImage) · [**下载 Linux 版（x64）**](https://downloads.accomplish.ai/downloads/0.4.13/linux/Accomplish-0.4.13-linux-x86_64.AppImage) · [**下载 Linux 版（.deb x64）**](https://downloads.accomplish.ai/downloads/0.4.13/linux/Accomplish-0.4.13-linux-amd64.deb)

</div>

<br />

---

<br />

## 截图和演示

快速了解 macOS 上的 Accomplish，以及简短的演示视频。

<p align="center">
  <a href="https://youtu.be/UJ0FIufMOlc?si=iFcu3VTG4B4q9VCB">
    <img src="docs/video-thumbnail.png" alt="Accomplish 演示 - AI 代理自动化文件管理和浏览器任务" width="600" />
  </a>
</p>

<p align="center">
  <a href="https://youtu.be/UJ0FIufMOlc?si=iFcu3VTG4B4q9VCB">观看演示 →</a>
</p>

<br />

## 常见问题

**Accomplish 是本地运行的吗？**
是的。Accomplish 在您的机器上本地运行，您可以控制它可以访问哪些文件夹。

**我需要 API 密钥吗？**
您可以使用您自己的 API 密钥（OpenAI、Anthropic、Google、xAI 等）或通过 Ollama 运行本地模型。

**Accomplish 是免费的吗？**
是的。Accomplish 是开源的，采用 MIT 许可证。

**支持哪些平台？**
macOS（Apple Silicon）和 Windows 11 现已可用。 Ubuntu (ARM64) 和 Ubuntu (x64) 同样支持。

<br />

---

<br />

## 开发

```bash
pnpm install
pnpm dev
```

就这样。

<details>
<summary><strong>前提条件</strong></summary>

- Node.js 20+
- pnpm 9+

</details>

<details>
<summary><strong>所有命令</strong></summary>

| 命令                                        | 描述                             |
| ------------------------------------------- | -------------------------------- |
| `pnpm dev`                                  | 在开发模式下运行桌面应用         |
| `pnpm dev:clean`                            | 干净启动的开发模式               |
| `pnpm build`                                | 构建所有工作区                   |
| `pnpm build:desktop`                        | 仅构建桌面应用                   |
| `pnpm -F @accomplish/desktop package:win`   | 构建 Windows 安装程序 (x64)      |
| `pnpm -F @accomplish/desktop package:linux` | 构建 Linux 构件 (AppImage + deb) |
| `pnpm lint`                                 | TypeScript 检查                  |
| `pnpm typecheck`                            | 类型验证                         |
| `pnpm -F @accomplish/desktop test:e2e`      | Playwright E2E 测试              |

</details>

<details>
<summary><strong>环境变量</strong></summary>

| 变量              | 描述                       |
| ----------------- | -------------------------- |
| `CLEAN_START=1`   | 应用启动时清除所有存储数据 |
| `E2E_SKIP_AUTH=1` | 跳过引导流程（用于测试）   |

</details>

<details>
<summary><strong>架构</strong></summary>

```
apps/
  desktop/        # Electron 应用（main + preload + renderer）
packages/
  shared/         # 共享 TypeScript 类型
```

桌面应用使用 Electron 和通过 Vite 打包的 React UI。主进程使用 `node-pty` 生成 [OpenCode](https://github.com/sst/opencode) CLI 来执行任务。API 密钥安全存储在操作系统密钥链中。

详细架构文档请参阅 [CLAUDE.md](CLAUDE.md)。

</details>

<br />

---

<br />

## 贡献

欢迎贡献！随时提交 PR。

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

**[Accomplish 官网](https://www.accomplish.ai/)** · **[Accomplish 博客](https://www.accomplish.ai/blog/)** · **[Accomplish 发布版本](https://github.com/accomplish-ai/accomplish/releases)** · **[问题反馈](https://github.com/accomplish-ai/accomplish/issues)** · **[Twitter](https://x.com/Accomplish_ai)**

<br />

MIT 许可证 · 由 [Accomplish](https://www.accomplish.ai) 构建

<br />

**关键词：** AI 代理、AI 桌面代理、桌面自动化、文件管理、文档创建、浏览器自动化、本地优先、macOS、隐私优先、开源、Electron、计算机使用、AI 助手、工作流自动化、OpenAI、Anthropic、Google、xAI、Claude、GPT-4、Ollama

</div>
