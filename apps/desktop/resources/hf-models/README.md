Place bundled local HuggingFace/ONNX model files in this directory when packaging.

Expected layout for the default model:

`apps/desktop/resources/hf-models/onnx-community/Qwen2.5-0.5B-Instruct/...`

When this model tree is present, the desktop app will auto-configure
`onnx-community/Qwen2.5-0.5B-Instruct` as the default local model on first launch.
