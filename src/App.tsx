import { useCallback, useEffect, useRef, useState } from 'react';
import { InputPanel } from './components/InputPanel';
import { ResultPanel } from './components/ResultPanel';
import { IconSparkles } from './components/icons';
import { DEFAULT_MODE_ID, MODES, getMode } from './lib/modes';
import {
  MAX_RECORDS,
  createId,
  loadHistory,
  saveHistory,
  type HistoryRecord,
} from './lib/history';
import { hasApiKey, optimizePrompt, streamGenerate } from './lib/zhipu';
import type { ModeId } from './types';

export default function App() {
  const [modeId, setModeId] = useState<ModeId>(DEFAULT_MODE_ID);
  const [input, setInput] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryRecord[]>(() => loadHistory());
  const abortRef = useRef<AbortController | null>(null);

  const mode = getMode(modeId);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const handleGenerate = useCallback(async () => {
    if (!input.trim() || loading) return;

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setOutput('');
    setCopied(false);

    try {
      const stream = streamGenerate({ mode, input, temperature, maxTokens, signal: controller.signal });
      let full = '';
      for await (const chunk of stream) {
        if (controller.signal.aborted) break;
        full += chunk;
        setOutput((prev) => prev + chunk);
      }

      // 生成结束（含主动停止后的部分内容）后写入历史
      if (full.trim()) {
        const record: HistoryRecord = {
          id: createId(),
          modeId: mode.id,
          modeLabel: mode.label,
          input: input.trim(),
          prompt: mode.buildPrompt(input),
          content: full,
          createdAt: Date.now(),
        };
        setHistory((prev) => [record, ...prev].slice(0, MAX_RECORDS));
      }
    } catch (streamError) {
      if ((streamError as Error)?.name !== 'AbortError') {
        setError(streamError instanceof Error ? streamError.message : '生成失败，请稍后重试');
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [input, loading, maxTokens, mode, temperature]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    setLoading(false);
  }, []);

  const handleSelectHistory = useCallback((record: HistoryRecord) => {
    setModeId(record.modeId);
    setInput(record.input);
    setOutput(record.content);
    setError(null);
    setCopied(false);
  }, []);

  const handleDeleteHistory = useCallback((id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleOptimize = useCallback(async () => {
    if (!input.trim() || optimizing || loading) return;

    setOptimizing(true);
    setError(null);
    try {
      const improved = await optimizePrompt({ mode, input });
      setInput(improved);
    } catch (optimizeError) {
      setError(optimizeError instanceof Error ? optimizeError.message : '提示词优化失败');
    } finally {
      setOptimizing(false);
    }
  }, [input, loading, mode, optimizing]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
    } catch {
      const helper = document.createElement('textarea');
      helper.value = output;
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.appendChild(helper);
      helper.select();
      document.execCommand('copy');
      document.body.removeChild(helper);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [output]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/60 to-violet-50/60">
      <div className="pointer-events-none fixed -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-32 -right-16 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <header className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-4 py-1.5 text-xs font-medium text-indigo-600 shadow-sm">
            <IconSparkles className="h-3.5 w-3.5" />
            智谱 GLM · 流式输出
          </span>
          <h1 className="mt-5 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
            智能写作助手
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
            支持续写、改写、扩展、总结、邮件、文案六种写作模式，输入你的想法，让 AI 帮你把内容写得更好
          </p>
        </header>

        <main className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
          <InputPanel
            modes={MODES}
            modeId={modeId}
            onModeChange={setModeId}
            value={input}
            onChange={setInput}
            temperature={temperature}
            onTemperatureChange={setTemperature}
            maxTokens={maxTokens}
            onMaxTokensChange={setMaxTokens}
            loading={loading}
            optimizing={optimizing}
            onOptimize={handleOptimize}
            onGenerate={handleGenerate}
            onStop={handleStop}
            history={history}
            onSelectHistory={handleSelectHistory}
            onDeleteHistory={handleDeleteHistory}
          />
          <ResultPanel
            content={output}
            loading={loading}
            modeLabel={mode.label}
            error={error}
            demoMode={!hasApiKey}
            copied={copied}
            onCopy={handleCopy}
            onClear={() => {
              setOutput('');
              setError(null);
              setCopied(false);
            }}
          />
        </main>

        <footer className="mt-8 text-center text-xs text-slate-400">
          {hasApiKey
            ? '已接入智谱 AI，内容由模型实时生成'
            : '当前为演示模式：复制 .env.example 为 .env 并填入 VITE_ZHIPU_API_KEY 后重启即可真实生成'}
        </footer>
      </div>
    </div>
  );
}
