import { useEffect, useRef } from 'react';
import { Markdown } from './Markdown';
import { IconAlert, IconCheck, IconCopy, IconDocument, IconSpinner, IconTrash } from './icons';

interface ResultPanelProps {
  content: string;
  loading: boolean;
  modeLabel: string;
  error: string | null;
  demoMode: boolean;
  copied: boolean;
  onCopy: () => void;
  onClear: () => void;
}

export function ResultPanel({
  content,
  loading,
  modeLabel,
  error,
  demoMode,
  copied,
  onCopy,
  onClear,
}: ResultPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (node && loading) node.scrollTop = node.scrollHeight;
  }, [content, loading]);

  const hasContent = content.length > 0;

  return (
    <section className="card flex h-full flex-col p-6">
      <header className="mb-5 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          <IconDocument className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-slate-800">生成结果</h2>
          <p className="truncate text-xs text-slate-500">
            {loading ? '正在流式生成…' : hasContent ? `${modeLabel} · ${content.length} 字` : '等待生成'}
          </p>
        </div>
        {hasContent && !loading && (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
            已完成
          </span>
        )}
      </header>

      <div
        ref={scrollRef}
        className="min-h-[22rem] flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-gradient-to-b
          from-slate-50/80 to-white p-5 scrollbar-slim"
      >
        {error ? (
          <div className="flex animate-fade-in gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <IconAlert className="mt-0.5 h-4 w-4 text-rose-500" />
            <div>
              <p className="font-medium">生成失败</p>
              <p className="mt-1 break-words text-rose-600/90">{error}</p>
            </div>
          </div>
        ) : hasContent ? (
          <div className="animate-fade-in break-words">
            <Markdown content={content} />
            {loading && (
              <span className="ml-0.5 inline-block h-4 w-[2px] animate-blink bg-indigo-500 align-middle" />
            )}
          </div>
        ) : loading ? (
          <div className="flex h-full items-center justify-center gap-2 text-sm text-slate-400">
            <IconSpinner className="h-4 w-4 text-indigo-500" />
            正在生成内容，请稍候…
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <span className="flex h-14 w-14 animate-float-slow items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-100 text-indigo-400">
              <IconDocument className="h-7 w-7" />
            </span>
            <p className="text-sm font-medium text-slate-500">还没有内容</p>
            <p className="max-w-xs text-xs leading-6 text-slate-400">
              在左侧选择写作模式并输入内容，点击「生成内容」后，结果会在这里实时流式呈现。
            </p>
          </div>
        )}
      </div>

      <footer className="mt-5 flex items-center gap-3">
        <button type="button" className="btn-ghost" onClick={onCopy} disabled={!hasContent || loading}>
          {copied ? <IconCheck className="h-4 w-4 text-emerald-500" /> : <IconCopy className="h-4 w-4" />}
          {copied ? '已复制' : '复制内容'}
        </button>
        <button type="button" className="btn-ghost" onClick={onClear} disabled={!hasContent || loading}>
          <IconTrash className="h-4 w-4" />
          清空
        </button>
        {demoMode && (
          <span className="ml-auto text-xs text-slate-400">演示模式 · 未配置 API Key</span>
        )}
      </footer>
    </section>
  );
}
