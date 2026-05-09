/**
 * TaskService helpers for browser-server management and summary generation.
 * Extracted from task-config-builder.ts to maintain 200 line limit.
 */
import {
  ensureDevBrowserServer,
  generateTaskSummary,
  DEV_BROWSER_PORT,
  logger,
  type BrowserServerConfig,
  type TaskConfig,
  type TaskCallbacks,
  type StorageAPI,
} from '@accomplish_ai/agent-core';
import { type TaskConfigBuilderOptions, getBundledNodeBinPath } from './task-config-builder.js';

export function getBrowserServerConfig(opts: TaskConfigBuilderOptions): BrowserServerConfig {
  return {
    mcpToolsPath: opts.mcpToolsPath,
    bundledNodeBinPath: getBundledNodeBinPath(opts),
    devBrowserPort: DEV_BROWSER_PORT,
  };
}

export function createOnBeforeTaskStart(
  opts: TaskConfigBuilderOptions,
): (callbacks: TaskCallbacks, isFirst: boolean, config: TaskConfig) => Promise<void> {
  return async (callbacks, isFirst, config) => {
    if (!shouldPrepareBrowser(config.prompt)) {
      return;
    }

    const browserConfig = getBrowserServerConfig(opts);
    if (!browserConfig.mcpToolsPath) {
      return;
    }
    if (isFirst) {
      callbacks.onProgress({
        stage: 'browser',
        message: 'Preparing browser...',
        isFirstTask: isFirst,
      });
    }
    await ensureDevBrowserServer(browserConfig, callbacks.onProgress);
  };
}

function shouldPrepareBrowser(prompt: string): boolean {
  const normalized = prompt.toLowerCase();
  return [
    'http://',
    'https://',
    'www.',
    'browser',
    'chrome',
    'website',
    'webpage',
    'open ',
    'click',
    'search',
    'google',
    '网页',
    '网站',
    '浏览器',
    '打开',
    '访问',
    '点击',
    '搜索',
    '百度',
    '谷歌',
    '页面',
    '登录',
    '表单',
  ].some((keyword) => normalized.includes(keyword));
}

export function runTaskSummaryGeneration(
  taskId: string,
  prompt: string,
  storage: StorageAPI,
  emitSummary: (summary: string) => void,
): void {
  generateTaskSummary(prompt, (provider: string) => storage.getApiKey(provider))
    .then((summary: string) => {
      storage.updateTaskSummary(taskId, summary);
      emitSummary(summary);
    })
    .catch((err: unknown) => {
      logger.warn('[TaskService] Failed to generate task summary', { err, taskId });
    });
}
