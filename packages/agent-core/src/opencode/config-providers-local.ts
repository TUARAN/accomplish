/** Local/self-hosted provider config builders: Ollama, LM Studio, HuggingFace Local. */
import {
  getOllamaConfig,
  getLMStudioConfig,
  getHuggingFaceLocalConfig,
} from '../storage/repositories/index.js';
import { createConsoleLogger } from '../utils/logging.js';
import type { ProviderModelConfig } from './config-generator.js';
import type { ProviderBuildContext, ProviderBuildResult } from './config-provider-context.js';

const log = createConsoleLogger({ prefix: 'OpenCodeConfigBuilder' });

export async function buildOllamaConfig(ctx: ProviderBuildContext): Promise<ProviderBuildResult> {
  const { providerSettings } = ctx;
  const ollamaProvider = providerSettings.connectedProviders.ollama;
  if (
    ollamaProvider?.connectionStatus === 'connected' &&
    ollamaProvider.credentials.type === 'ollama' &&
    ollamaProvider.selectedModelId
  ) {
    const modelId = ollamaProvider.selectedModelId.replace(/^ollama\//, '');
    const ollamaModelInfo = ollamaProvider.availableModels?.find(
      (m) => m.id === ollamaProvider.selectedModelId || m.id === modelId,
    );
    const toolSupport = (ollamaModelInfo as { toolSupport?: string } | undefined)?.toolSupport;
    const ollamaSupportsTools = toolSupport === 'supported' || toolSupport === undefined;
    log.info(
      `[OpenCode Config Builder] Ollama configured: ${modelId} (tools: ${ollamaSupportsTools})`,
    );
    return {
      configs: [
        {
          id: 'ollama',
          npm: '@ai-sdk/openai-compatible',
          name: 'Ollama (local)',
          options: { baseURL: `${ollamaProvider.credentials.serverUrl}/v1` },
          models: {
            [modelId]: { name: modelId, tools: ollamaSupportsTools },
            [`ollama/${modelId}`]: { name: modelId, tools: ollamaSupportsTools },
          },
        },
      ],
      enableToAdd: [],
    };
  }

  // Legacy path: getOllamaConfig()
  const ollamaConfig = getOllamaConfig();
  const ollamaModels = ollamaConfig?.models;
  if (ollamaConfig?.enabled && ollamaModels && ollamaModels.length > 0) {
    const models: Record<string, ProviderModelConfig> = {};
    for (const model of ollamaModels) {
      const legacyToolSupport =
        model.toolSupport === 'supported' || model.toolSupport === undefined;
      models[model.id] = { name: model.displayName, tools: legacyToolSupport };
      models[`ollama/${model.id}`] = { name: model.displayName, tools: legacyToolSupport };
    }
    log.info(`[OpenCode Config Builder] Ollama (legacy) configured: ${Object.keys(models)}`);
    return {
      configs: [
        {
          id: 'ollama',
          npm: '@ai-sdk/openai-compatible',
          name: 'Ollama (local)',
          options: { baseURL: `${ollamaConfig.baseUrl}/v1` },
          models,
        },
      ],
      enableToAdd: [],
    };
  }
  return { configs: [], enableToAdd: [] };
}

export async function buildLMStudioConfig(ctx: ProviderBuildContext): Promise<ProviderBuildResult> {
  const { providerSettings } = ctx;
  const lmstudioProvider = providerSettings.connectedProviders.lmstudio;
  if (
    lmstudioProvider?.connectionStatus === 'connected' &&
    lmstudioProvider.credentials.type === 'lmstudio' &&
    lmstudioProvider.selectedModelId
  ) {
    const modelId = lmstudioProvider.selectedModelId.replace(/^lmstudio\//, '');
    const modelInfo = lmstudioProvider.availableModels?.find(
      (m) => m.id === lmstudioProvider.selectedModelId || m.id === modelId,
    );
    const supportsTools = (modelInfo as { toolSupport?: string })?.toolSupport === 'supported';
    log.info(
      `[OpenCode Config Builder] LM Studio configured: ${modelId} (tools: ${supportsTools})`,
    );
    return {
      configs: [
        {
          id: 'lmstudio',
          npm: '@ai-sdk/openai-compatible',
          name: 'LM Studio',
          options: { baseURL: `${lmstudioProvider.credentials.serverUrl}/v1` },
          models: { [modelId]: { name: modelId, tools: supportsTools } },
        },
      ],
      enableToAdd: ['lmstudio'],
    };
  }

  // Legacy path: getLMStudioConfig()
  const lmstudioConfig = getLMStudioConfig();
  const lmstudioModels = lmstudioConfig?.models;
  if (lmstudioConfig?.enabled && lmstudioModels && lmstudioModels.length > 0) {
    const models: Record<string, ProviderModelConfig> = {};
    for (const model of lmstudioModels) {
      models[model.id] = { name: model.name, tools: model.toolSupport === 'supported' };
    }
    log.info(`[OpenCode Config Builder] LM Studio (legacy) configured: ${Object.keys(models)}`);
    return {
      configs: [
        {
          id: 'lmstudio',
          npm: '@ai-sdk/openai-compatible',
          name: 'LM Studio',
          options: { baseURL: `${lmstudioConfig.baseUrl}/v1` },
          models,
        },
      ],
      enableToAdd: ['lmstudio'],
    };
  }
  return { configs: [], enableToAdd: [] };
}

export function buildHuggingFaceLocalConfig(ctx: ProviderBuildContext): ProviderBuildResult {
  const { providerSettings } = ctx;
  const hfProvider = providerSettings.connectedProviders['huggingface-local'];
  const hfConfig = getHuggingFaceLocalConfig();
  if (
    hfProvider?.connectionStatus !== 'connected' ||
    hfProvider.credentials.type !== 'huggingface-local' ||
    !hfProvider.selectedModelId ||
    !hfConfig?.serverPort
  ) {
    return { configs: [], enableToAdd: [] };
  }

  const modelId = hfProvider.selectedModelId.replace(/^huggingface-local\//, '');
  const baseURL = `http://127.0.0.1:${hfConfig.serverPort}/v1`;
  log.info(`[OpenCode Config Builder] HuggingFace Local configured: ${modelId} baseURL: ${baseURL}`);

  return {
    configs: [
      {
        id: 'huggingface-local',
        npm: '@ai-sdk/openai-compatible',
        name: 'HuggingFace Local',
        options: {
          baseURL,
          apiKey: 'accomplish-local',
        },
        models: {
          [modelId]: { name: modelId, tools: true },
        },
      },
    ],
    enableToAdd: ['huggingface-local'],
  };
}
