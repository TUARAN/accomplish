import fs from 'fs';
import http from 'http';
import net from 'net';
import path from 'path';
import { spawn, type ChildProcess } from 'child_process';
import { app } from 'electron';
import { getStorage } from '../../store/storage';
import { getLogCollector } from '../../logging';
import { getNodePath } from '../../utils/bundled-node';
import {
  getWritableHfCachePath,
  resolveExistingModelCacheRoot,
} from './model-paths';
import { getConfiguredRemoteHost } from './transformers-env';

const DEFAULT_HF_SERVER_PORT = 8787;
const HF_SERVER_PORT_CANDIDATES = [8787, 8788, 8789, 11535, 18087];
const START_TIMEOUT_MS = 60_000;
const POLL_INTERVAL_MS = 500;

let serverProcess: ChildProcess | null = null;
let loadedModelId: string | null = null;
let serverPort: number | null = null;
let startServerPromise: Promise<{ success: boolean; port?: number; error?: string }> | null = null;

function getServerScriptPath(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'hf-local-server.mjs')
    : path.join(app.getAppPath(), 'resources', 'hf-local-server.mjs');
}

function getServerLogPath(): string {
  return path.join(app.getPath('userData'), 'hf-local-server.log');
}

function getServerWorkingDirectory(): string {
  return app.isPackaged ? process.resourcesPath : app.getAppPath();
}

function getServerNodePath(): string {
  return app.isPackaged ? path.join(process.resourcesPath, 'node_modules') : path.join(app.getAppPath(), 'node_modules');
}

function log(level: 'INFO' | 'WARN' | 'ERROR', message: string, data?: Record<string, unknown>) {
  try {
    getLogCollector().log(level, 'main', message, data);
  } catch {
    // best effort
  }
}

async function isPortHealthy(port: number): Promise<boolean> {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForHealthy(port: number, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isPortHealthy(port)) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  return false;
}

async function canListenOnPort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const probe = net.createServer();
    probe.once('error', () => {
      resolve(false);
    });
    probe.listen(port, '127.0.0.1', () => {
      probe.close(() => resolve(true));
    });
  });
}

async function resolveServerPort(): Promise<number> {
  for (const port of [serverPort, ...HF_SERVER_PORT_CANDIDATES].filter(
    (value): value is number => typeof value === 'number',
  )) {
    if (await isPortHealthy(port)) {
      return port;
    }
    if (await canListenOnPort(port)) {
      return port;
    }
  }

  throw new Error('No available local model server port found');
}

function getCacheDir(modelId: string): string {
  return resolveExistingModelCacheRoot(modelId) || getWritableHfCachePath();
}

function spawnStandaloneServer(modelId: string, port: number): ChildProcess {
  const scriptPath = getServerScriptPath();
  const cacheDir = getCacheDir(modelId);
  const remoteHost = getConfiguredRemoteHost();
  const nodePath = getNodePath();
  const logPath = getServerLogPath();
  const cwd = getServerWorkingDirectory();
  const nodeModulesPath = getServerNodePath();
  const logFd = fs.openSync(logPath, 'a');

  log('INFO', '[HF Server] Spawning standalone local model server', {
    modelId,
    cacheDir,
    scriptPath,
    nodePath,
    cwd,
    nodeModulesPath,
    remoteHost: remoteHost || undefined,
  });

  return spawn(
    nodePath,
    [
      scriptPath,
      '--model',
      modelId,
      '--cache-dir',
      cacheDir,
      '--port',
      String(port),
      ...(remoteHost ? ['--remote-host', remoteHost] : []),
    ],
    {
      stdio: ['ignore', logFd, logFd],
      cwd,
      env: {
        ...process.env,
        HF_ENDPOINT: remoteHost || process.env.HF_ENDPOINT || '',
        NODE_PATH: process.env.NODE_PATH
          ? `${nodeModulesPath}${path.delimiter}${process.env.NODE_PATH}`
          : nodeModulesPath,
      },
    },
  );
}

export async function startServer(
  modelId: string,
): Promise<{ success: boolean; port?: number; error?: string }> {
  if (startServerPromise) {
    return startServerPromise;
  }

  startServerPromise = (async () => {
    const preferredPort = await resolveServerPort();
    serverPort = preferredPort;

    if (await isPortHealthy(preferredPort)) {
      loadedModelId = modelId;
      log('INFO', `[HF Server] Reusing existing server on http://127.0.0.1:${preferredPort}`, {
        modelId,
        port: preferredPort,
      });
      startServerPromise = null;
      return { success: true, port: preferredPort };
    }

    if (serverProcess && loadedModelId === modelId && (await isPortHealthy(preferredPort))) {
      return { success: true, port: preferredPort };
    }

    await stopServer().catch(() => {});
    serverPort = preferredPort;

    try {
      serverProcess = spawnStandaloneServer(modelId, preferredPort);
    } catch (error) {
      startServerPromise = null;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to spawn local model server',
      };
    }

    const healthy = await waitForHealthy(preferredPort, START_TIMEOUT_MS);
    if (!healthy) {
      const error = 'Local model server did not become ready in time';
      log('ERROR', `[HF Server] ${error}`);
      await stopServer().catch(() => {});
      startServerPromise = null;
      return { success: false, error };
    }

    loadedModelId = modelId;
    try {
      const storage = getStorage();
      const existingConfig = storage.getHuggingFaceLocalConfig();
      if (existingConfig) {
        storage.setHuggingFaceLocalConfig({ ...existingConfig, serverPort: preferredPort });
      }
    } catch (error) {
      log('WARN', '[HF Server] Failed to persist server port', { error: String(error) });
    }

    log('INFO', `[HF Server] Standalone server is ready on http://127.0.0.1:${preferredPort}`);
    startServerPromise = null;
    return { success: true, port: preferredPort };
  })();

  return startServerPromise;
}

export async function stopServer(): Promise<void> {
  const proc = serverProcess;
  serverProcess = null;
  loadedModelId = null;
  serverPort = null;
  startServerPromise = null;

  if (!proc || proc.killed) {
    return;
  }

  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      proc.kill('SIGKILL');
      resolve();
    }, 5000);

    proc.once('exit', () => {
      clearTimeout(timeout);
      resolve();
    });

    proc.kill('SIGTERM');
  });
}

export function getServerStatus(): {
  running: boolean;
  port: number | null;
  loadedModel: string | null;
  isLoading: boolean;
} {
  return {
    running: Boolean(serverProcess || serverPort),
    port: serverPort,
    loadedModel: loadedModelId,
    isLoading: Boolean(startServerPromise),
  };
}

export async function testConnection(): Promise<{ success: boolean; error?: string }> {
  const ok = serverPort ? await isPortHealthy(serverPort) : false;
  return ok ? { success: true } : { success: false, error: 'Server is not running' };
}
