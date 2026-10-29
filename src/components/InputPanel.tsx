import type { LengthOption, ModeId, WritingMode } from '../types';
import { ModeSelect } from './ModeSelect';
import { IconSparkles, IconSpinner } from './icons';

interface InputPanelProps {
  modes: WritingMode[];
  modeId: ModeId;
  onModeChange: (id: ModeId) => void;
  value: string;
  onChange: (value: string) => void;
  temperature: number;
  onTemperatureChange: (value: number) => void;
  maxTokens: number;
  onMaxTokensChange: (value: number) => void;
  lengthOptions: LengthOption[];
  loading: boolean;
  optimizing: boolean;
  onOptimize: () => void;
  onGenerate: () => void;
  onStop: () => void;
}

export function InputPanel({
  modes,
  modeId,
  onModeChange,
  value,
  onChange,
  temperature,
  onTemperatureChange,
  maxTokens,
  onMaxTokensChange,
  lengthOptions,
  loading,
  optimizing,
  onOptimize,
  onGenerate,
  onStop,
}: InputPanelProps) {
  const mode = modes.find((item) => item.id === modeId) ?? modes[0];
  const disabled = loading || optimizing;
  const canGenerate = value.trim().length > 0 && !disabled;
  const temperaturePercent = Math.round(temperature * 100);

  return (
    <section className="card flex flex-col p-6">
      <header className="mb-5 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <IconSparkles className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-800">写作输入</h2>
          <p className="text-xs text-slate-500">选择模式并描述需求，AI 为你生成内容</p>
        </div>
      </header>

      <div className="mb-5">
        <label className="field-label">
          写作模式
          <span className="text-xs font-normal text-slate-400">共 {modes.length} 种</span>
        </label>
        <ModeSelect modes={modes} value={modeId} onChange={onModeChange} disabled={disabled} />
      </div>

      <div className="mb-5 flex-1">
        <label htmlFor="writing-input" className="field-label">
          内容输入
          <span className="ml-auto text-xs font-normal tabular-nums text-slate-400">
            {value.length} 字
          </span>
        </label>
        <textarea
          id="writing-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={mode.placeholder}
          spellCheck={false}
          className="h-64 w-full resize-none rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm
            leading-7 text-slate-700 outline-none transition placeholder:text-slate-400
            hover:border-slate-300 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100
            scrollbar-slim"
        />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="temperature" className="field-label">
            创意度
            <span className="ml-auto text-xs font-normal tabular-nums text-indigo-600">
              {temperature.toFixed(1)}
            </span>
          </label>
          <input
            id="temperature"
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={temperature}
            disabled={disabled}
            onChange={(event) => onTemperatureChange(Number(event.target.value))}
            style={{
              background: `linear-gradient(to right, #6366f1 ${temperaturePercent}%, #e2e8f0 ${temperaturePercent}%)`,
            }}
          />
          <div className="mt-2 flex justify-between text-[11px] text-slate-400">
            <span>严谨精确</span>
            <span>天马行空</span>
          </div>
        </div>

        <div>
          <label className="field-label">输出长度</label>
          <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1">
            {lengthOptions.map((option) => {
              const active = option.value === maxTokens;
              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={disabled}
                  title={option.description}
                  onClick={() => onMaxTokensChange(option.value)}
                  className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition
                    ${active ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}
                    disabled:cursor-not-allowed`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            {lengthOptions.find((option) => option.value === maxTokens)?.description}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" className="btn-ghost sm:w-auto" onClick={onOptimize} disabled={disabled || !value.trim()}>
          {optimizing ? <IconSpinner className="h-4 w-4" /> : <IconSparkles className="h-4 w-4 text-violet-500" />}
          {optimizing ? '优化中…' : '优化提示词'}
        </button>

        {loading ? (
          <button type="button" className="btn-primary flex-1" onClick={onStop}>
            <IconSpinner className="h-4 w-4" />
            停止生成
          </button>
        ) : (
          <button type="button" className="btn-primary flex-1" onClick={onGenerate} disabled={!canGenerate}>
            <IconSparkles className="h-4 w-4" />
            生成内容
          </button>
        )}
      </div>
    </section>
  );
}
