// apps/desktop/src/renderer/components/settings/hooks/useProviderSettings.ts

import { useState, useEffect, useCallback } from 'react';
import { getAccomplish } from '@/lib/accomplish';
import type {
  ProviderSettings,
  ProviderId,
  ConnectedProvider,
} from '@accomplish_ai/agent-core/common';
import { getHuggingFaceLocalErrorMessage } from '@/components/settings/providers/huggingface-errors';

export function useProviderSettings() {
  const [settings, setSettings] = useState<ProviderSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const accomplish = getAccomplish();
      const data = (await accomplish.getProviderSettings()) as ProviderSettings;
      setSettings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const setActiveProvider = useCallback(async (providerId: ProviderId | null) => {
    const accomplish = getAccomplish();
    await accomplish.setActiveProvider(providerId);
    setSettings((prev) => (prev ? { ...prev, activeProviderId: providerId } : null));
  }, []);

  const connectProvider = useCallback(
    async (providerId: ProviderId, provider: ConnectedProvider) => {
      const accomplish = getAccomplish();
      await accomplish.setConnectedProvider(providerId, provider);
      setSettings((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          connectedProviders: {
            ...prev.connectedProviders,
            [providerId]: provider,
          },
        };
      });
    },
    [],
  );

  const disconnectProvider = useCallback(async (providerId: ProviderId) => {
    const accomplish = getAccomplish();
    await accomplish.removeConnectedProvider(providerId);
    setSettings((prev) => {
      if (!prev) return null;
      const { [providerId]: _, ...rest } = prev.connectedProviders;
      return {
        ...prev,
        connectedProviders: rest,
        activeProviderId: prev.activeProviderId === providerId ? null : prev.activeProviderId,
      };
    });
  }, []);

  const updateModel = useCallback(async (providerId: ProviderId, modelId: string | null) => {
    const accomplish = getAccomplish();
    const currentSettings = (await accomplish.getProviderSettings()) as ProviderSettings;
    const currentProvider = currentSettings.connectedProviders[providerId];

    const persistedModelId =
      providerId === 'huggingface-local' && modelId
        ? modelId.replace(/^huggingface-local\//, '')
        : modelId;

    if (providerId === 'huggingface-local' && persistedModelId) {
      const rawModelId = persistedModelId;
      const downloadResult = await accomplish.downloadHuggingFaceModel(rawModelId);
      if (!downloadResult.success) {
        throw new Error(
          getHuggingFaceLocalErrorMessage(
            downloadResult.error,
            'Failed to download HuggingFace Local model',
          ),
        );
      }
      const serverResult = await accomplish.startHuggingFaceServer(rawModelId);
      if (!serverResult.success) {
        throw new Error(
          getHuggingFaceLocalErrorMessage(
            serverResult.error,
            'Failed to start HuggingFace Local server',
          ),
        );
      }
      const existingConfig = await accomplish.getHuggingFaceLocalConfig().catch(() => null);
      await accomplish.setHuggingFaceLocalConfig({
        selectedModelId: rawModelId,
        serverPort: serverResult.port ?? existingConfig?.serverPort ?? null,
        enabled: true,
        quantization: existingConfig?.quantization ?? 'q4',
        devicePreference: existingConfig?.devicePreference ?? 'auto',
      });

      if (currentProvider?.credentials.type === 'huggingface-local') {
        await accomplish.setConnectedProvider(providerId, {
          ...currentProvider,
          selectedModelId: rawModelId,
          credentials: {
            ...currentProvider.credentials,
            modelId: rawModelId,
          },
          availableModels: [
            {
              id: rawModelId,
              name: rawModelId.split('/').pop() ?? rawModelId,
            },
          ],
        });
      }
    }

    await accomplish.updateProviderModel(providerId, persistedModelId);
    setSettings((prev) => {
      if (!prev) return null;
      const provider = prev.connectedProviders[providerId];
      if (!provider) return prev;
      if (
        providerId === 'huggingface-local' &&
        persistedModelId &&
        provider.credentials.type === 'huggingface-local'
      ) {
        const rawModelId = persistedModelId;
        return {
          ...prev,
          connectedProviders: {
            ...prev.connectedProviders,
            [providerId]: {
              ...provider,
              selectedModelId: rawModelId,
              credentials: {
                ...provider.credentials,
                modelId: rawModelId,
              },
              availableModels: [
                {
                  id: rawModelId,
                  name: rawModelId.split('/').pop() ?? rawModelId,
                },
              ],
            },
          },
        };
      }
      return {
        ...prev,
        connectedProviders: {
          ...prev.connectedProviders,
          [providerId]: { ...provider, selectedModelId: persistedModelId },
        },
      };
    });
  }, []);

  const setDebugMode = useCallback(async (enabled: boolean) => {
    const accomplish = getAccomplish();
    await accomplish.setProviderDebugMode(enabled);
    setSettings((prev) => (prev ? { ...prev, debugMode: enabled } : null));
  }, []);

  /**
   * Atomically switches to a model on a different provider.
   * Rolls back the model update if activating the provider fails.
   */
  const switchProviderModel = useCallback(async (providerId: ProviderId, modelId: string) => {
    const accomplish = getAccomplish();
    // Capture previousModelId before writing so the rollback target is the original value
    const current = (await accomplish.getProviderSettings()) as ProviderSettings;
    const previousModelId = current.connectedProviders[providerId]?.selectedModelId ?? null;
    await accomplish.updateProviderModel(providerId, modelId);
    try {
      await accomplish.setActiveProvider(providerId);
    } catch (err) {
      // Revert the model update so settings stay consistent
      try {
        await accomplish.updateProviderModel(providerId, previousModelId);
      } catch {
        // Best-effort rollback; ignore secondary failure
      }
      throw err;
    }
    setSettings((prev) => {
      if (!prev) return null;
      const provider = prev.connectedProviders[providerId];
      return {
        ...prev,
        activeProviderId: providerId,
        connectedProviders: provider
          ? { ...prev.connectedProviders, [providerId]: { ...provider, selectedModelId: modelId } }
          : prev.connectedProviders,
      };
    });
  }, []);

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
    setActiveProvider,
    connectProvider,
    disconnectProvider,
    updateModel,
    switchProviderModel,
    setDebugMode,
  };
}
