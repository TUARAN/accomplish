import { describe, expect, it } from 'vitest';
import { normalizeSelectedModelForSdk } from '../../../src/opencode/model-runtime-mapping.js';

describe('normalizeSelectedModelForSdk', () => {
  it('normalizes Z.AI models to the OpenCode coding-plan provider', () => {
    expect(
      normalizeSelectedModelForSdk({
        provider: 'zai',
        model: 'zai/glm-5',
      }),
    ).toEqual({
      providerID: 'zai-coding-plan',
      modelID: 'glm-5',
    });
  });

  it('normalizes HuggingFace Local models for its OpenAI-compatible provider', () => {
    expect(
      normalizeSelectedModelForSdk({
        provider: 'huggingface-local',
        model: 'huggingface-local/onnx-community/Qwen2.5-0.5B-Instruct',
      }),
    ).toEqual({
      providerID: 'huggingface-local',
      modelID: 'onnx-community/Qwen2.5-0.5B-Instruct',
    });
  });
});
