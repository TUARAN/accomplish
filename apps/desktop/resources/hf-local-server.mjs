import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { env, AutoTokenizer, AutoModelForCausalLM } from '@huggingface/transformers';

function parseArgs(argv) {
  const args = new Map();
  for (let i = 2; i < argv.length; i += 2) {
    args.set(argv[i], argv[i + 1]);
  }
  return {
    modelId: args.get('--model'),
    cacheDir: args.get('--cache-dir'),
    port: Number(args.get('--port') || '11434'),
    remoteHost: args.get('--remote-host') || '',
  };
}

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (origin && /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function writeJsonError(res, status, message, type = 'server_error') {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: { message, type } }));
}

function readBody(req, limitBytes = 10 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    let overLimit = false;

    req.on('data', (chunk) => {
      if (overLimit) {
        return;
      }
      size += chunk.length;
      if (size > limitBytes) {
        overLimit = true;
        reject(new Error('PayloadTooLarge'));
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (!overLimit) {
        resolve(Buffer.concat(chunks).toString('utf-8'));
      }
    });
    req.on('error', reject);
  });
}

function formatChatPrompt(messages, tokenizer) {
  try {
    if (tokenizer.apply_chat_template) {
      return tokenizer.apply_chat_template(messages, {
        tokenize: false,
        add_generation_prompt: true,
      });
    }
  } catch {
    // Fall through to manual formatting
  }

  return (
    messages
      .map((message) => {
        if (message.role === 'system') {
          return `System: ${message.content}`;
        }
        if (message.role === 'user') {
          return `User: ${message.content}`;
        }
        return `Assistant: ${message.content}`;
      })
      .join('\n') + '\nAssistant:'
  );
}

function decodeGeneratedText(tokenizer, outputTensor, promptLength) {
  const allTokens = Array.from(outputTensor.ort_tensor?.cpuData || []);
  const generatedTokens = allTokens.slice(promptLength);
  return {
    text: tokenizer.decode(generatedTokens, { skip_special_tokens: true }),
    completionTokens: generatedTokens.length,
  };
}

function writeSseChunk(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

async function main() {
  const { modelId, cacheDir, port, remoteHost } = parseArgs(process.argv);
  if (!modelId || !cacheDir || !port) {
    throw new Error('Missing required args: --model --cache-dir --port');
  }

  fs.mkdirSync(cacheDir, { recursive: true });
  env.cacheDir = cacheDir;
  env.allowLocalModels = true;
  env.allowRemoteModels = false;
  if (remoteHost) {
    env.remoteHost = remoteHost.endsWith('/') ? remoteHost : `${remoteHost}/`;
  }

  const tokenizer = await AutoTokenizer.from_pretrained(modelId, {
    cache_dir: cacheDir,
    local_files_only: true,
  });

  let model;
  try {
    model = await AutoModelForCausalLM.from_pretrained(modelId, {
      cache_dir: cacheDir,
      dtype: 'q4',
      local_files_only: true,
    });
  } catch {
    model = await AutoModelForCausalLM.from_pretrained(modelId, {
      cache_dir: cacheDir,
      dtype: 'fp32',
      local_files_only: true,
    });
  }

  const server = http.createServer(async (req, res) => {
    setCorsHeaders(req, res);

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = req.url || '';

    try {
      if (req.method === 'GET' && (url === '/' || url === '/health')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', model: modelId }));
        return;
      }

      if (req.method === 'GET' && url === '/v1/models') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            object: 'list',
            data: [
              {
                id: modelId,
                object: 'model',
                created: Math.floor(Date.now() / 1000),
                owned_by: 'huggingface-local',
              },
            ],
          }),
        );
        return;
      }

      if (req.method === 'POST' && url === '/v1/chat/completions') {
        const body = await readBody(req);
        const payload = JSON.parse(body);
        const messages = Array.isArray(payload.messages) ? payload.messages : [];
        if (messages.length === 0) {
          writeJsonError(res, 400, 'messages must be a non-empty array', 'invalid_request_error');
          return;
        }

        const prompt = formatChatPrompt(messages, tokenizer);
        const inputs = tokenizer(prompt, { return_tensor: true });
        const outputs = await model.generate({
          ...inputs,
          max_new_tokens: payload.max_tokens ?? 512,
          temperature: payload.temperature ?? 0.7,
          top_p: payload.top_p ?? 0.9,
          do_sample: (payload.temperature ?? 0.7) > 0,
        });

        const promptLength = inputs.input_ids.dims?.[1] || 0;
        const { text, completionTokens } = decodeGeneratedText(tokenizer, outputs, promptLength);
        const trimmedText = text.trim();
        const id = `chatcmpl-hf-${Date.now()}`;
        const created = Math.floor(Date.now() / 1000);
        const usage = {
          prompt_tokens: promptLength,
          completion_tokens: completionTokens,
          total_tokens: promptLength + completionTokens,
        };

        if (payload.stream) {
          res.writeHead(200, {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
          });

          writeSseChunk(res, {
            id,
            object: 'chat.completion.chunk',
            created,
            model: modelId,
            choices: [
              {
                index: 0,
                delta: { role: 'assistant' },
                finish_reason: null,
              },
            ],
          });

          if (trimmedText) {
            writeSseChunk(res, {
              id,
              object: 'chat.completion.chunk',
              created,
              model: modelId,
              choices: [
                {
                  index: 0,
                  delta: { content: trimmedText },
                  finish_reason: null,
                },
              ],
            });
          }

          writeSseChunk(res, {
            id,
            object: 'chat.completion.chunk',
            created,
            model: modelId,
            choices: [
              {
                index: 0,
                delta: {},
                finish_reason: 'stop',
              },
            ],
            usage,
          });
          res.end('data: [DONE]\n\n');
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            id,
            object: 'chat.completion',
            created,
            model: modelId,
            choices: [
              {
                index: 0,
                message: {
                  role: 'assistant',
                  content: trimmedText,
                },
                finish_reason: 'stop',
              },
            ],
            usage,
          }),
        );
        return;
      }

      writeJsonError(res, 404, 'Not found', 'invalid_request_error');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      writeJsonError(
        res,
        message === 'PayloadTooLarge' ? 413 : 500,
        message,
        message === 'PayloadTooLarge' ? 'invalid_request_error' : 'server_error',
      );
    }
  });

  server.listen(port, '127.0.0.1', () => {
    console.log(`HF_LOCAL_SERVER_READY:${port}`);
  });

  const shutdown = async () => {
    server.close(() => {
      Promise.resolve(model?.dispose?.())
        .catch(() => {})
        .finally(() => {
          process.exit(0);
        });
    });
  };

  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
