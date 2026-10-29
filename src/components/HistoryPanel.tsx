import type { HistoryRecord } from '../lib/history';
import { getMode } from '../lib/modes';
import { MODE_ICONS, IconClock, IconTrash } from './icons';

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

interface HistoryPanelProps {
  records: HistoryRecord[];
  onSelect: (record: HistoryRecord) => void;
  onDelete: (id: string) => void;
}

export function HistoryPanel({ records, onSelect, onDelete }: HistoryPanelProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50/60">
      <header className="flex items-center gap-2 px-4 py-3">
        <IconClock className="h-4 w-4 text-indigo-500" />
        <h3 className="text-sm font-medium text-slate-700">历史记录</h3>
        <span className="text-xs text-slate-400">{records.length}</span>
      </header>

      {records.length === 0 ? (
        <p className="border-t border-slate-200 px-4 py-4 text-xs leading-6 text-slate-400">
          还没有历史记录，生成一次内容后会自动保存在本地。
        </p>
      ) : (
        <ul className="max-h-64 space-y-1.5 overflow-y-auto px-2 pb-2 scrollbar-slim">
          {records.map((record) => {
            const Icon = MODE_ICONS[getMode(record.modeId).icon];
            const summary = record.input.trim() || record.prompt.trim();

            return (
              <li key={record.id} className="group relative">
                <button
                  type="button"
                  onClick={() => onSelect(record)}
                  title="点击载入这条记录"
                  className="w-full rounded-lg border border-transparent px-3 py-2.5 pr-9 text-left transition
                    hover:border-indigo-200 hover:bg-white focus:outline-none focus-visible:ring-2
                    focus-visible:ring-indigo-400"
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs font-medium text-slate-600">{record.modeLabel}</span>
                    <span className="ml-auto text-[11px] tabular-nums text-slate-400">
                      {formatTime(record.createdAt)}
                    </span>
                  </span>
                  <span className="mt-1 block truncate text-xs text-slate-500">
                    {summary || '（无输入内容）'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(record.id)}
                  title="删除这条记录"
                  className="absolute right-2 top-2 rounded-md p-1.5 text-slate-400 opacity-0 transition
                    hover:bg-rose-50 hover:text-rose-500 focus-visible:opacity-100 group-hover:opacity-100"
                >
                  <IconTrash className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
