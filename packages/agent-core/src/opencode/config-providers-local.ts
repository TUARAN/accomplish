/** Local/self-hosted provider config builders: Ollama, LM Studio. */
import { getOllamaConfig, getLMStudioConfig } from '../storage/repositories/index.js';
import { createConsoleLogger } from '../utils/logging.js';
import type { ProviderModelConfig } from './config-generator.js';
import type { ProviderBuildContext, ProviderBuildResult } from './config-provider-context.js';

const log = createConsoleLogger({ prefix: 'OpenCodeConfigBuilder' });

export async function buildOllamaConfig(ctx: ProviderBuildContext): Promise<ProviderBuildResult> {
  const { providerSettings, activeModel } = ctx;
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
    // Pin OpenCode's `model` + `small_model` to the selected Ollama model so a
    // local-only setup actually routes prompts to Ollama. Without this, the
    // generated `opencode.json` had no `model` field and OpenCode fell back to
    // its built-in default (Anthropic) — small Ollama models like llama3.2:1b
    // never got called and the user saw an Anthropic-API auth error instead.
    const overrideModel =
      activeModel?.provider === 'ollama' && activeModel.model
        ? activeModel.model
        : `ollama/${modelId}`;
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
      modelOverride: { model: overrideModel, smallModel: overrideModel },
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
    // Same rationale as the connected-provider branch above: when only Ollama
    // is configured, default OpenCode to the active legacy model (or the first
    // registered one) so it does not fall back to Anthropic.
    const legacyOverrideModel =
      activeModel?.provider === 'ollama' && activeModel.model
        ? activeModel.model
        : `ollama/${ollamaModels[0].id}`;
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
      modelOverride: { model: legacyOverrideModel, smallModel: legacyOverrideModel },
    };
  }
  return { configs: [], enableToAdd: [] };
}

export async function buildLMStudioConfig(ctx: ProviderBuildContext): Promise<ProviderBuildResult> {
  const { providerSettings, activeModel } = ctx;
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
    // Same rationale as Ollama above: pin OpenCode's `model` + `small_model`
    // to the selected LM Studio model. Without this the generated config has
    // no `model`, OpenCode silently falls back to the Anthropic default, and
    // small local LM Studio models never get called.
    const overrideModel =
      activeModel?.provider === 'lmstudio' && activeModel.model
        ? activeModel.model
        : `lmstudio/${modelId}`;
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
      modelOverride: { model: overrideModel, smallModel: overrideModel },
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
    const legacyOverrideModel =
      activeModel?.provider === 'lmstudio' && activeModel.model
        ? activeModel.model
        : `lmstudio/${lmstudioModels[0].id}`;
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
      modelOverride: { model: legacyOverrideModel, smallModel: legacyOverrideModel },
    };
  }
  return { configs: [], enableToAdd: [] };
}
