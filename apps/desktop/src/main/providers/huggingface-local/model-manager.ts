/**
 * HuggingFace Local Model Manager
 *
 * Lists, caches, and manages ONNX-format HuggingFace models.
 * Download logic is in model-downloader.ts.
 */

import fs from 'fs';
import path from 'path';
import type { HuggingFaceLocalModelInfo } from '@accomplish_ai/agent-core/common';
import {
  DEFAULT_HF_LOCAL_MODEL_DISPLAY_NAME,
  DEFAULT_HF_LOCAL_MODEL_ID,
  getHfCacheRoots,
  getModelDir,
  getWritableHfCachePath,
  hasCachedModel,
} from './model-paths';
import { downloadModel as downloadModelInternal, type ProgressCallback } from './model-downloader';

export type { DownloadProgress, ProgressCallback } from './model-downloader';
export { cancelDownload } from './model-downloader';

/**
 * Suggested ONNX-compatible models for quick setup.
 * These are small models known to work well with Transformers.js.
 */
export const SUGGESTED_MODELS: HuggingFaceLocalModelInfo[] = [
  {
    id: DEFAULT_HF_LOCAL_MODEL_ID,
    displayName: DEFAULT_HF_LOCAL_MODEL_DISPLAY_NAME,
    downloaded: false,
  },
  {
    id: 'onnx-community/Llama-3.2-1B-Instruct-ONNX',
    displayName: 'Llama 3.2 1B Instruct (ONNX)',
    downloaded: false,
  },
  {
    id: 'onnx-community/Phi-3.5-mini-instruct-onnx',
    displayName: 'Phi-3.5 Mini Instruct (ONNX)',
    downloaded: false,
  },
  {
    id: 'onnx-community/Qwen2.5-0.5B-Instruct',
    displayName: 'Qwen2.5 0.5B Instruct (ONNX)',
    downloaded: false,
  },
  {
    id: 'Xenova/distilgpt2',
    displayName: 'DistilGPT-2 (Tiny, for testing)',
    downloaded: false,
  },
];

/** Ensure cache directory exists */
function ensureCacheDir(cachePath?: string): string {
  const dir = cachePath || getWritableHfCachePath();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * List all cached models in the cache directory.
 */
export function listCachedModels(cachePath?: string): HuggingFaceLocalModelInfo[] {
  const cacheDirs = cachePath ? [cachePath] : getHfCacheRoots();
  const models = new Map<string, HuggingFaceLocalModelInfo>();

  try {
    for (const cacheDir of cacheDirs) {
      if (!fs.existsSync(cacheDir)) {
        continue;
      }
      // Transformers.js caches models in subdirectories named after the model
      // Structure: cacheDir/<org>/<model>/
      const entries = fs.readdirSync(cacheDir, { withFileTypes: true });
      for (const orgEntry of entries) {
        if (!orgEntry.isDirectory()) {
          continue;
        }
        const orgDir = path.join(cacheDir, orgEntry.name);
        const modelEntries = fs.readdirSync(orgDir, { withFileTypes: true });
        for (const modelEntry of modelEntries) {
          if (!modelEntry.isDirectory()) {
            continue;
          }
          const modelDir = path.join(orgDir, modelEntry.name);
          const modelId = `${orgEntry.name}/${modelEntry.name}`;
          if (models.has(modelId)) {
            continue;
          }
          const sizeBytes = getDirSize(modelDir);
          models.set(modelId, {
            id: modelId,
            displayName: modelEntry.name,
            sizeBytes,
            downloaded: true,
          });
        }
      }
    }
  } catch (error) {
    console.warn('[HF Local] Error listing cached models:', error);
  }

  return Array.from(models.values());
}

/**
 * Delete a cached model.
 */
export function deleteModel(
  modelId: string,
  cachePath?: string,
): { success: boolean; error?: string } {
  const cacheDir = ensureCacheDir(cachePath || getWritableHfCachePath());
  const resolvedCache = path.resolve(cacheDir);

  // Normalize and pre-validate modelId to block path-traversal sequences
  const normalizedId = path.normalize(modelId);
  if (
    !normalizedId ||
    normalizedId.includes('\0') ||
    path.isAbsolute(normalizedId) ||
    normalizedId.split(path.sep).includes('..')
  ) {
    return { success: false, error: 'Invalid model ID' };
  }

  const modelDir = path.resolve(resolvedCache, normalizedId);

  // Guard against path traversal: modelDir must be strictly inside cacheDir
  const rel = path.relative(resolvedCache, modelDir);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) {
    return { success: false, error: 'Invalid model ID' };
  }

  if (!fs.existsSync(modelDir)) {
    return { success: false, error: 'Model not found in cache' };
  }

  try {
    fs.rmSync(modelDir, { recursive: true, force: true });

    // Clean up empty parent org directory
    const orgDir = path.dirname(modelDir);
    const remaining = fs.readdirSync(orgDir);
    if (remaining.length === 0) {
      fs.rmdirSync(orgDir);
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export function downloadModel(
  modelId: string,
  onProgress?: ProgressCallback,
  cachePath?: string,
): Promise<{ success: boolean; error?: string }> {
  return downloadModelInternal(modelId, onProgress, cachePath || getWritableHfCachePath());
}

/** Recursively compute directory size in bytes */
function getDirSize(dirPath: string): number {
  let total = 0;
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isFile()) {
        total += fs.statSync(fullPath).size;
      } else if (entry.isDirectory()) {
        total += getDirSize(fullPath);
      }
    }
  } catch {
    // Ignore errors (permission issues etc.)
  }
  return total;
}

/**
 * Get the absolute path to the local model cache directory.
 */
export function getCachePath(): string {
  return getWritableHfCachePath();
}

export {
  DEFAULT_HF_LOCAL_MODEL_ID,
  DEFAULT_HF_LOCAL_MODEL_DISPLAY_NAME,
  getWritableHfCachePath,
  getModelDir,
  hasCachedModel,
};
