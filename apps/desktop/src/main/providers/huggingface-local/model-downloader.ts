/**
 * HuggingFace Model Downloader
 *
 * Handles downloading ONNX-format HuggingFace models via Transformers.js auto-download.
 */

import fs from 'fs';

/**
 * Translate the cryptic transformers.js / fetch failures the user sees when
 * `huggingface.co` is unreachable (GFW, broken proxy, no Wi-Fi, mirror down)
 * into a single actionable message. The raw symptom is usually
 * `Cannot read properties of undefined (reading 'tokenizer_class')` because
 * transformers.js does not null-check the parsed config before reading fields
 * off it.
 */
function describeDownloadError(rawMessage: string): string {
  const tokenizerSymptom = /tokenizer_class|tokenizer_config|model\.onnx/i.test(rawMessage);
  const networkSymptom = /fetch failed|ENOTFOUND|ECONNRESET|ETIMEDOUT|EAI_AGAIN|getaddrinfo/i.test(
    rawMessage,
  );
  const fileMissingSymptom = /Could not locate file|404|Unable to fetch file metadata/i.test(
    rawMessage,
  );
  if (tokenizerSymptom || networkSymptom || fileMissingSymptom) {
    const endpoint = process.env.HF_ENDPOINT?.trim() || 'https://huggingface.co';
    return (
      `Could not download model from ${endpoint}. ` +
      `Check your network/proxy and that the host is reachable. ` +
      `In regions where huggingface.co is blocked, set HF_ENDPOINT (e.g. https://hf-mirror.com) before launching the app. ` +
      `(Underlying error: ${rawMessage})`
    );
  }
  return rawMessage;
}

/**
 * Apply user-configurable HF endpoint + cache settings to the transformers.js
 * `env` object before any from_pretrained call. `env.remoteHost` is the upstream
 * the library hits to download model files; defaults to https://huggingface.co.
 * `HF_ENDPOINT` is the same env var the official `huggingface_hub` Python client
 * honours, so users coming from the Python side already know the convention.
 */
function configureTransformersEnv(env: Record<string, unknown>, cacheDir: string): void {
  if (cacheDir) {
    env.cacheDir = cacheDir;
  }
  env.allowRemoteModels = true;
  const endpoint = process.env.HF_ENDPOINT?.trim();
  if (endpoint) {
    env.remoteHost = endpoint;
  }
}

export interface DownloadProgress {
  modelId: string;
  status: 'downloading' | 'complete' | 'error';
  progress: number; // 0-100
  downloadedBytes?: number;
  totalBytes?: number;
  error?: string;
}

export type ProgressCallback = (progress: DownloadProgress) => void;

// Track active downloads
const activeDownloads = new Map<string, { abort: AbortController }>();

/**
 * Download a model from HuggingFace Hub using Transformers.js auto-download.
 * Transformers.js handles model file resolution and caching internally.
 */
export async function downloadModel(
  modelId: string,
  onProgress?: ProgressCallback,
  cachePath?: string,
): Promise<{ success: boolean; error?: string }> {
  const cacheDir = cachePath || '';
  if (cacheDir && !fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  // Note: Transformers.js does not currently support abort signals for from_pretrained.
  // The AbortController is stored for potential future cancellation support.
  const abortController = new AbortController();
  activeDownloads.set(modelId, { abort: abortController });

  try {
    onProgress?.({ modelId, status: 'downloading', progress: 0 });

    // Dynamically import Transformers.js (it's ESM-only)
    const { env, AutoTokenizer, AutoModelForCausalLM } = await import('@huggingface/transformers');

    configureTransformersEnv(env as unknown as Record<string, unknown>, cacheDir);

    // Download tokenizer + model via Transformers.js auto-download
    onProgress?.({ modelId, status: 'downloading', progress: 10 });

    await AutoTokenizer.from_pretrained(modelId);

    onProgress?.({ modelId, status: 'downloading', progress: 30 });

    try {
      await AutoModelForCausalLM.from_pretrained(modelId, {
        dtype: 'q4', // Try quantized first
      });
    } catch (err) {
      console.warn(`[HF Manager] Failed to download q4 model, trying fp32: ${err}`);
      onProgress?.({ modelId, status: 'downloading', progress: 50 });
      await AutoModelForCausalLM.from_pretrained(modelId, {
        dtype: 'fp32', // Fallback to fp32
      });
    }

    onProgress?.({ modelId, status: 'complete', progress: 100 });

    return { success: true };
  } catch (error) {
    const raw = error instanceof Error ? error.message : 'Unknown download error';
    const message = describeDownloadError(raw);
    onProgress?.({ modelId, status: 'error', progress: 0, error: message });
    return { success: false, error: message };
  } finally {
    activeDownloads.delete(modelId);
  }
}

/**
 * Cancel an active download.
 *
 * Note: Transformers.js does not currently support aborting in-progress downloads.
 * This function marks the download as cancelled but the underlying network request
 * will continue until completion. The downloaded files will remain in the cache.
 */
export function cancelDownload(modelId: string): void {
  const download = activeDownloads.get(modelId);
  if (download) {
    download.abort.abort();
    activeDownloads.delete(modelId);
  }
}
