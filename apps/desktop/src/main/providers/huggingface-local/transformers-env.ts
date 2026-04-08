import type { env as TransformersEnv } from '@huggingface/transformers';

function normalizeRemoteHost(url: string): string {
  return url.endsWith('/') ? url : `${url}/`;
}

export function getConfiguredRemoteHost(): string | null {
  const configuredHost =
    process.env.ACCOMPLISH_HF_REMOTE_HOST ||
    process.env.HF_ENDPOINT ||
    process.env.HUGGING_FACE_HUB_BASE_URL ||
    process.env.HUGGINGFACE_ENDPOINT;

  if (!configuredHost) {
    return null;
  }

  return normalizeRemoteHost(configuredHost.trim());
}

export function configureTransformersEnv(
  env: typeof TransformersEnv,
  options: {
    cacheDir: string;
    allowLocalModels?: boolean;
  },
): void {
  env.cacheDir = options.cacheDir;
  env.allowLocalModels = options.allowLocalModels ?? true;

  const remoteHost = getConfiguredRemoteHost();
  if (remoteHost) {
    env.remoteHost = remoteHost;
  }
}
