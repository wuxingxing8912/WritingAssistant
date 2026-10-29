/**
 * 六种写作模式的提示词模板
 * 模板原文来自 prompts.md，每个函数接收用户输入，返回可直接发送给模型的完整提示词。
 */

import type { ModeId } from './types';

/** prompts.md 中的原始模板 */
export const PROMPT_TEMPLATES = {
  continue: '请继续写下面的文章，保持风格一致，内容连贯：\n[用户输入的内容]',
  rewrite: '请改写下面的内容，使其更加流畅、专业\n[用户输入的内容]',
  expand: '请扩写下面的内容，增加更多细节和例子：\n[用户输入的内容]',
  summarize: '请总结下面的内容，提取核心要点：\n[用户输入的内容]',
  email: '请写一封[正式/友好]的邮件，主题是：[主题]',
  copywriting: '请为[产品名称]写一段[风格]风格的营销文案',
} as const;

/** 指令 + 换行 + 用户输入 */
function withContent(instruction: string, input: string): string {
  return `${instruction}\n${input.trim()}`;
}

/** 去掉捕获内容开头的分隔符（如「主题是：：xxx」中的多余冒号） */
function trimSeparators(value: string): string {
  return value.replace(/^[\s：:，,、]+/, '').trim();
}

/** 文章续写 */
export function buildContinuePrompt(input: string): string {
  return withContent('请继续写下面的文章，保持风格一致，内容连贯：', input);
}

/** 内容改写 */
export function buildRewritePrompt(input: string): string {
  return withContent('请改写下面的内容，使其更加流畅、专业', input);
}

/** 内容扩展 */
export function buildExpandPrompt(input: string): string {
  return withContent('请扩写下面的内容，增加更多细节和例子：', input);
}

/** 内容总结 */
export function buildSummarizePrompt(input: string): string {
  return withContent('请总结下面的内容，提取核心要点：', input);
}

const EMAIL_TONES: { keywords: string[]; tone: string }[] = [
  { keywords: ['正式', '商务', '严谨', '官方', '严肃', '领导', '客户'], tone: '正式' },
  { keywords: ['友好', '轻松', '亲切', '口语', '温和', '同事', '朋友'], tone: '友好' },
];

/** 从用户输入中推断邮件语气，默认「正式」 */
export function detectEmailTone(input: string): string {
  const hit = EMAIL_TONES.find((item) => item.keywords.some((keyword) => input.includes(keyword)));
  return hit?.tone ?? '正式';
}

/** 提取邮件主题，未识别到时使用整段输入 */
export function extractEmailTopic(input: string): string {
  const content = input.trim();
  const matched = content.match(/主题(?:是|为|：|:)\s*([^\n，,。；;]+)/);
  return trimSeparators(matched?.[1] ?? content);
}

/** 邮件撰写：[正式/友好] 与 [主题] 由用户输入推断填充 */
export function buildEmailPrompt(input: string): string {
  return PROMPT_TEMPLATES.email
    .replace('[正式/友好]', detectEmailTone(input))
    .replace('[主题]', extractEmailTopic(input));
}

const COPY_STYLES: { keywords: string[]; style: string }[] = [
  { keywords: ['幽默', '搞笑', '诙谐', '有趣'], style: '幽默' },
  { keywords: ['文艺', '诗意', '抒情', '治愈'], style: '文艺' },
  { keywords: ['专业', '商务', '严谨', '理性'], style: '专业' },
  { keywords: ['活泼', '年轻', '活力', '潮流', '社交媒体', '小红书'], style: '活泼' },
  { keywords: ['温情', '温暖', '情感', '走心'], style: '温情' },
];

/** 从用户输入中推断文案风格，默认「有吸引力」 */
export function detectCopyStyle(input: string): string {
  const hit = COPY_STYLES.find((item) => item.keywords.some((keyword) => input.includes(keyword)));
  return hit?.style ?? '有吸引力';
}

/** 提取产品名称，未识别到时使用整段输入 */
export function extractProductName(input: string): string {
  const content = input.trim();
  if (!content) return '该产品';

  const patterns = [
    /(?:为|给)\s*([^\s，,。；;]{1,30}?)\s*(?:写|撰写|生成|创作|设计)/,
    /(?:产品|产品名称|产品名)\s*(?:是|为|：|:)?\s*([^\s，,。；;]{1,30})/,
  ];
  for (const pattern of patterns) {
    const matched = content.match(pattern);
    if (matched?.[1]) return trimSeparators(matched[1]);
  }
  return content;
}

/** 文案生成：[产品名称] 与 [风格] 由用户输入推断填充 */
export function buildCopywritingPrompt(input: string): string {
  return PROMPT_TEMPLATES.copywriting
    .replace('[产品名称]', extractProductName(input))
    .replace('[风格]', detectCopyStyle(input));
}

/** 模式 → 提示词构造函数 */
export const PROMPT_BUILDERS: Record<ModeId, (input: string) => string> = {
  continue: buildContinuePrompt,
  rewrite: buildRewritePrompt,
  expand: buildExpandPrompt,
  summarize: buildSummarizePrompt,
  email: buildEmailPrompt,
  copywriting: buildCopywritingPrompt,
};

/** 按模式生成完整提示词 */
export function buildPrompt(mode: ModeId, input: string): string {
  return PROMPT_BUILDERS[mode](input);
}
