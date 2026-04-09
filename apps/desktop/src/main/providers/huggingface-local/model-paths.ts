import fs from 'fs';
import path from 'path';
import { app } from 'electron';

export const DEFAULT_HF_LOCAL_MODEL_ID = 'onnx-community/Qwen3.5-0.8B-Text-ONNX';
export const DEFAULT_HF_LOCAL_MODEL_DISPLAY_NAME = 'Qwen3.5 0.8B Text (ONNX)';

export function getWritableHfCachePath(): string {
  return path.join(app.getPath('userData'), 'hf-models');
}

export function getBundledHfCachePath(): string | null {
  const root = app.isPackaged ? process.resourcesPath : process.env.APP_ROOT || app.getAppPath();
  if (!root) {
    return null;
  }
  return path.join(root, 'resources', 'hf-models');
}

export function getHfCacheRoots(): string[] {
  const roots = [getWritableHfCachePath(), getBundledHfCachePath()].filter(
    (value): value is string => Boolean(value),
  );

  return roots.filter((dir, index) => roots.indexOf(dir) === index && fs.existsSync(dir));
}

export function getModelDir(cacheRoot: string, modelId: string): string {
  return path.join(cacheRoot, ...modelId.split('/'));
}

export function resolveExistingModelCacheRoot(modelId: string): string | null {
  for (const root of getHfCacheRoots()) {
    if (fs.existsSync(getModelDir(root, modelId))) {
      return root;
    }
  }
  return null;
}

export function hasCachedModel(modelId: string): boolean {
  return resolveExistingModelCacheRoot(modelId) !== null;
}
