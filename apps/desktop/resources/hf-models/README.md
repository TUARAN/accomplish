Place bundled local HuggingFace/ONNX model files in this directory when packaging.

Expected layout for the default model:

`apps/desktop/resources/hf-models/onnx-community/Qwen3.5-0.8B-Text-ONNX/...`

When this model tree is present, the desktop app will auto-configure
`onnx-community/Qwen3.5-0.8B-Text-ONNX` as the default local model on first launch.
