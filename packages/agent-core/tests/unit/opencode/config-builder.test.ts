import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { buildProviderConfigs } from '../../../src/opencode/config-builder.js';

// Mock storage repositories so the test doesn't hit the DB
vi.mock('../../../src/storage/repositories/index.js', () => ({
  getOllamaConfig: () => null,
  getLMStudioConfig: () => null,
  getHuggingFaceLocalConfig: () => null,
  getProviderSettings: () => ({
    connectedProviders: {},
  }),
  getActiveProviderModel: () => null,
  getConnectedProviderIds: () => [],
  getActiveProviderId: () => null,
  getConnectedProvider: () => null,
  getSelectedModel: () => null,
  getAzureFoundryConfig: () => null,
}));

// Mock proxy helpers
vi.mock('../../../src/opencode/proxies/index.js', () => ({
  ensureAzureFoundryProxy: vi.fn().mockResolvedValue({ baseURL: 'http://proxy' }),
  ensureMoonshotProxy: vi.fn().mockResolvedValue({ baseURL: 'http://proxy' }),
}));

describe('buildProviderConfigs', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Google AI provider', () => {
    it('registers the selected Google model so OpenCode can resolve it', async () => {
      const result = await buildProviderConfigs({
        getApiKey: (p) => (p === 'google' ? 'test-google-api-key' : undefined),
        providerSettings: {
          connectedProviders: {
            google: {
              providerId: 'google',
              connectionStatus: 'connected',
              selectedModelId: 'google/gemini-3.1-flash-lite-preview',
              credentials: { type: 'google' },
              availableModels: [
                {
                  id: 'google/gemini-3.1-flash-lite-preview',
                  name: 'Gemini 3.1 Flash Lite Preview',
                },
                { id: 'google/gemini-3-pro-preview', name: 'Gemini 3 Pro' },
              ],
            },
          },
        } as never,
      });

      const googleConfig = result.providerConfigs.find((p) => p.id === 'google');
      expect(googleConfig).toBeDefined();
      expect(googleConfig?.models).toBeDefined();
      expect(googleConfig?.models?.['gemini-3.1-flash-lite-preview']).toBeDefined();
      expect(googleConfig?.models?.['gemini-3-pro-preview']).toBeDefined();
    });

    it('falls back to registering only the selected model when availableModels is empty', async () => {
      const result = await buildProviderConfigs({
        getApiKey: (p) => (p === 'google' ? 'test-google-api-key' : undefined),
        providerSettings: {
          connectedProviders: {
            google: {
              providerId: 'google',
              connectionStatus: 'connected',
              selectedModelId: 'google/gemini-3.1-flash-lite-preview',
              credentials: { type: 'google' },
              availableModels: [],
            },
          },
        } as never,
      });

      const googleConfig = result.providerConfigs.find((p) => p.id === 'google');
      expect(googleConfig).toBeDefined();
      expect(googleConfig?.models?.['gemini-3.1-flash-lite-preview']).toBeDefined();
    });

    it('falls back to registering only the selected model when availableModels is undefined', async () => {
      const result = await buildProviderConfigs({
        getApiKey: (p) => (p === 'google' ? 'test-google-api-key' : undefined),
        providerSettings: {
          connectedProviders: {
            google: {
              providerId: 'google',
              connectionStatus: 'connected',
              selectedModelId: 'google/gemini-3.1-flash-lite-preview',
              credentials: { type: 'google' },
            },
          },
        } as never,
      });

      const googleConfig = result.providerConfigs.find((p) => p.id === 'google');
      expect(googleConfig).toBeDefined();
      expect(googleConfig?.models?.['gemini-3.1-flash-lite-preview']).toBeDefined();
    });

    it('does not push google providerConfig when no API key is set', async () => {
      const result = await buildProviderConfigs({
        getApiKey: () => undefined,
        providerSettings: {
          connectedProviders: {
            google: {
              providerId: 'google',
              connectionStatus: 'connected',
              selectedModelId: 'google/gemini-3-pro-preview',
              credentials: { type: 'google' },
              availableModels: [],
            },
          },
        } as never,
      });

      const googleConfig = result.providerConfigs.find((p) => p.id === 'google');
      expect(googleConfig).toBeUndefined();
    });
  });

  describe('Local providers (Ollama, LM Studio, HuggingFace Local)', () => {
    // Regression: when only Ollama/LM Studio is configured, the generated
    // OpenCode config used to omit `model` / `small_model`, which made
    // OpenCode fall back to its built-in Anthropic default and break with an
    // auth error. The local builders must surface a `modelOverride` so the
    // selected local model is actually used at run time.
    it('returns a modelOverride pointing at the selected Ollama model', async () => {
      const result = await buildProviderConfigs({
        getApiKey: () => undefined,
        providerSettings: {
          connectedProviders: {
            ollama: {
              providerId: 'ollama',
              connectionStatus: 'connected',
              selectedModelId: 'ollama/llama3.2:1b',
              credentials: { type: 'ollama', serverUrl: 'http://localhost:11434' },
              availableModels: [
                { id: 'ollama/llama3.2:1b', name: 'llama3.2:1b', toolSupport: 'supported' },
              ],
            },
          },
        } as never,
      });

      expect(result.modelOverride).toEqual({
        model: 'ollama/llama3.2:1b',
        smallModel: 'ollama/llama3.2:1b',
      });
      const ollamaConfig = result.providerConfigs.find((p) => p.id === 'ollama');
      expect(ollamaConfig?.options?.baseURL).toBe('http://localhost:11434/v1');
    });

    it('returns a modelOverride pointing at the selected LM Studio model', async () => {
      const result = await buildProviderConfigs({
        getApiKey: () => undefined,
        providerSettings: {
          connectedProviders: {
            lmstudio: {
              providerId: 'lmstudio',
              connectionStatus: 'connected',
              selectedModelId: 'lmstudio/qwen2.5-1.5b-instruct',
              credentials: { type: 'lmstudio', serverUrl: 'http://localhost:1234' },
              availableModels: [
                {
                  id: 'lmstudio/qwen2.5-1.5b-instruct',
                  name: 'Qwen2.5 1.5B Instruct',
                  toolSupport: 'supported',
                },
              ],
            },
          },
        } as never,
      });

      expect(result.modelOverride).toEqual({
        model: 'lmstudio/qwen2.5-1.5b-instruct',
        smallModel: 'lmstudio/qwen2.5-1.5b-instruct',
      });
      const lmstudioConfig = result.providerConfigs.find((p) => p.id === 'lmstudio');
      expect(lmstudioConfig?.options?.baseURL).toBe('http://localhost:1234/v1');
      expect(result.enabledProviders).toContain('lmstudio');
    });

    it('registers HuggingFace Local and points the modelOverride at the selected model', async () => {
      const result = await buildProviderConfigs({
        getApiKey: () => undefined,
        providerSettings: {
          connectedProviders: {
            'huggingface-local': {
              providerId: 'huggingface-local',
              connectionStatus: 'connected',
              selectedModelId: 'huggingface-local/onnx-community/Qwen2.5-0.5B-Instruct',
              credentials: {
                type: 'huggingface-local',
                modelId: 'onnx-community/Qwen2.5-0.5B-Instruct',
              },
              availableModels: [
                {
                  id: 'huggingface-local/onnx-community/Qwen2.5-0.5B-Instruct',
                  name: 'Qwen2.5 0.5B Instruct',
                },
              ],
            },
          },
        } as never,
      });

      expect(result.modelOverride).toEqual({
        model: 'huggingface-local/onnx-community/Qwen2.5-0.5B-Instruct',
        smallModel: 'huggingface-local/onnx-community/Qwen2.5-0.5B-Instruct',
      });
      const hfConfig = result.providerConfigs.find((p) => p.id === 'huggingface-local');
      expect(hfConfig).toBeDefined();
      expect(hfConfig?.npm).toBe('@ai-sdk/openai-compatible');
      expect(hfConfig?.options?.apiKey).toBe('accomplish-huggingface-local');
      expect(hfConfig?.models?.['onnx-community/Qwen2.5-0.5B-Instruct']).toEqual({
        name: 'onnx-community/Qwen2.5-0.5B-Instruct',
        tools: false,
      });
      expect(result.enabledProviders).toContain('huggingface-local');
    });
  });
});
