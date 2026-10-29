export type ModeId =
  | 'continue'
  | 'rewrite'
  | 'expand'
  | 'summarize'
  | 'email'
  | 'copywriting';

export type IconName =
  | 'pen'
  | 'refresh'
  | 'expand'
  | 'list'
  | 'mail'
  | 'megaphone';

export interface WritingMode {
  id: ModeId;
  label: string;
  icon: IconName;
  /** 下拉框中的一句话说明 */
  hint: string;
  placeholder: string;
  systemPrompt: string;
  /** 按 PRD 提示词模板拼接用户输入 */
  buildPrompt: (input: string) => string;
  /** 演示模式（未配置 API Key）下的示例输出正文 */
  sample: string;
}

export interface GenerateOptions {
  mode: WritingMode;
  input: string;
  temperature: number;
  maxTokens: number;
  signal?: AbortSignal;
}
