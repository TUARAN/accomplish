export function getHuggingFaceLocalErrorMessage(error: unknown, fallback: string): string {
  const message =
    error instanceof Error ? error.message : typeof error === 'string' ? error : fallback;

  if (
    message.includes("Cannot read properties of undefined (reading 'tokenizer_class')") ||
    message.includes('tokenizer_class')
  ) {
    return 'This HuggingFace Local model is not compatible with the current local runtime. Try another ONNX model, or use LM Studio/Ollama for this model.';
  }

  return message || fallback;
}
