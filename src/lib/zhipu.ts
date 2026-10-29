import type { GenerateOptions, WritingMode } from '../types';

/** 请求本地同源代理（见 vite.config.ts 的 /api/zhipu 代理），避免浏览器跨域直连被拦截 */
const API_URL = '/api/zhipu/chat/completions';
const MODEL = 'glm-4-flash';

/** API Key 存放在环境变量中（技术设计：VITE_ 前缀供浏览器端读取） */
const API_KEY = import.meta.env.VITE_ZHIPU_API_KEY as string | undefined;

export const hasApiKey = Boolean(API_KEY && API_KEY.trim().length > 0);

const MISSING_KEY_TIP =
  '未检测到 VITE_ZHIPU_API_KEY，当前为演示模式（模拟流式输出）。复制 .env.example 为 .env 并填入智谱 API Key 后即可真实生成。';

const OPTIMIZE_SYSTEM_PROMPT = `你是一位提示词工程专家。请优化用户给出的写作需求，使其描述更清晰、约束更明确。
只输出优化后的提示词本身，不要解释、不要加引号、不要使用 Markdown 标题。保持中文。`;

/** 统一约束输出格式，便于前端 Markdown 渲染 */
const OUTPUT_STYLE =
  '\n输出要求：使用 Markdown 组织内容（按需使用标题、列表、加粗、引用、表格），不要用代码块包裹整篇内容。';

interface ChatMessage {
  role: 'system' | 'user';
  content: string;
}

async function requestChat(
  messages: ChatMessage[],
  options: { temperature?: number; maxTokens?: number; stream: boolean; signal?: AbortSignal },
): Promise<Response> {
  if (!hasApiKey) {
    throw new Error(MISSING_KEY_TIP);
  }

  let response: Response;
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      signal: options.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1024,
        stream: options.stream,
      }),
    });
  } catch (networkError) {
    if ((networkError as Error)?.name === 'AbortError') throw networkError;
    throw new Error(
      '无法连接智谱 API（Failed to fetch）。请确认：1）通过 npm run dev 或 npm run preview 启动（需经过本地 /api/zhipu 代理）；2）网络可访问 open.bigmodel.cn；3）修改 .env 后已重启服务。',
    );
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`智谱 API 请求失败（${response.status}）：${detail.slice(0, 200)}`);
  }

  return response;
}

async function* readSSE(response: Response): AsyncGenerator<string> {
  const body = response.body;
  if (!body) throw new Error('响应体为空，无法流式读取');

  const reader = body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';

    for (const event of events) {
      for (const line of event.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === '[DONE]') continue;

        try {
          const json = JSON.parse(payload);
          const delta = json?.choices?.[0]?.delta?.content;
          if (typeof delta === 'string' && delta.length > 0) {
            yield delta;
          }
        } catch {
          // 忽略无法解析的片段，继续读取后续事件
        }
      }
    }
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** 演示模式：按流式节奏逐段吐出示例内容，保证界面在无 Key 时仍可体验 */
async function* simulateStream(mode: WritingMode, input: string, signal?: AbortSignal): AsyncGenerator<string> {
  const excerpt = input.trim().slice(0, 100);
  const text = [
    `> 演示模式 · ${MISSING_KEY_TIP}`,
    '',
    `**【${mode.label}】** 你的输入：${excerpt}${input.trim().length > 100 ? '……' : ''}`,
    '',
    mode.sample,
  ].join('\n');

  for (let i = 0; i < text.length; i += 4) {
    if (signal?.aborted) return;
    yield text.slice(i, i + 4);
    await sleep(18);
  }
}

/** 流式生成（PRD 核心功能 4） */
export async function* streamGenerate({
  mode,
  input,
  temperature,
  maxTokens,
  signal,
}: GenerateOptions): AsyncGenerator<string> {
  if (!hasApiKey) {
    yield* simulateStream(mode, input, signal);
    return;
  }

  const response = await requestChat(
    [
      { role: 'system', content: mode.systemPrompt + OUTPUT_STYLE },
      { role: 'user', content: mode.buildPrompt(input) },
    ],
    { temperature, maxTokens, stream: true, signal },
  );

  yield* readSSE(response);
}

/** 优化提示词（PRD 核心功能 5） */
export async function optimizePrompt({
  mode,
  input,
  signal,
}: {
  mode: WritingMode;
  input: string;
  signal?: AbortSignal;
}): Promise<string> {
  if (!hasApiKey) {
    await sleep(600);
    return [
      `【写作任务】${mode.label}`,
      `【核心内容】${input.trim()}`,
      '【要求】语言简洁准确，逻辑清晰，段落分明，风格统一，避免空泛表述；如有必要，请给出具体细节或示例。',
    ].join('\n');
  }

  const response = await requestChat(
    [
      { role: 'system', content: OPTIMIZE_SYSTEM_PROMPT },
      { role: 'user', content: `写作模式：${mode.label}\n原始需求：\n${input}` },
    ],
    { temperature: 0.3, maxTokens: 800, stream: false, signal },
  );

  const json = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const content = json.choices?.[0]?.message?.content?.trim();
  return content && content.length > 0 ? content : input;
}
