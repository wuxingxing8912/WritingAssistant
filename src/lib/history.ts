import type { ModeId } from '../types';

const STORAGE_KEY = 'writing-assistant:history:v1';

/** 最多保留的条数，避免 localStorage 无限膨胀 */
export const MAX_RECORDS = 50;

export interface HistoryRecord {
  id: string;
  modeId: ModeId;
  modeLabel: string;
  /** 用户输入 */
  input: string;
  /** 拼接后的完整提示词 */
  prompt: string;
  /** 生成结果 */
  content: string;
  createdAt: number;
}

export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function isRecord(value: unknown): value is HistoryRecord {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Partial<HistoryRecord>;
  return (
    typeof item.id === 'string' &&
    typeof item.content === 'string' &&
    typeof item.createdAt === 'number'
  );
}

/** 读取历史记录，按时间倒序 */
export function loadHistory(): HistoryRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRecord).sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export function saveHistory(records: HistoryRecord[]): void {
  try {
    // 与传入顺序无关：先按时间倒序，再保留最新的 MAX_RECORDS 条
    const sorted = [...records].sort((a, b) => b.createdAt - a.createdAt).slice(0, MAX_RECORDS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
  } catch {
    // 隐私模式或容量超限时忽略写入，不影响正常使用
  }
}
