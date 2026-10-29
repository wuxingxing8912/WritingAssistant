import { useState } from 'react';
import { IconChevronDown, IconSliders } from './icons';

export const TEMPERATURE_MIN = 0;
export const TEMPERATURE_MAX = 1;
export const TEMPERATURE_STEP = 0.1;

export const MAX_TOKENS_MIN = 100;
export const MAX_TOKENS_MAX = 2000;
export const MAX_TOKENS_STEP = 50;

interface SliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  valueText: string;
  leftHint: string;
  rightHint: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}

function Slider({
  id,
  label,
  value,
  min,
  max,
  step,
  valueText,
  leftHint,
  rightHint,
  disabled,
  onChange,
}: SliderProps) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <label htmlFor={id} className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
        {label}
        <span className="ml-auto text-xs font-normal tabular-nums text-indigo-600">{valueText}</span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{
          background: `linear-gradient(to right, #6366f1 ${percent}%, #e2e8f0 ${percent}%)`,
        }}
      />
      <div className="mt-2 flex justify-between text-[11px] text-slate-400">
        <span>{leftHint}</span>
        <span>{rightHint}</span>
      </div>
    </div>
  );
}

interface AdvancedSettingsProps {
  temperature: number;
  onTemperatureChange: (value: number) => void;
  maxTokens: number;
  onMaxTokensChange: (value: number) => void;
  disabled?: boolean;
}

/** 可折叠的高级设置：创意度（temperature）与输出长度（max_tokens），参数会随请求发送给 API */
export function AdvancedSettings({
  temperature,
  onTemperatureChange,
  maxTokens,
  onMaxTokensChange,
  disabled,
}: AdvancedSettingsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700
          transition hover:bg-slate-100/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      >
        <IconSliders className="h-4 w-4 text-indigo-500" />
        高级设置
        <span className="ml-auto text-xs font-normal tabular-nums text-slate-400">
          创意度 {temperature.toFixed(1)} · 长度 {maxTokens}
        </span>
        <IconChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="animate-fade-in space-y-5 border-t border-slate-200 px-4 py-4">
          <Slider
            id="temperature"
            label="创意度"
            value={temperature}
            min={TEMPERATURE_MIN}
            max={TEMPERATURE_MAX}
            step={TEMPERATURE_STEP}
            valueText={temperature.toFixed(1)}
            leftHint="严谨精确"
            rightHint="天马行空"
            disabled={disabled}
            onChange={onTemperatureChange}
          />
          <Slider
            id="max-tokens"
            label="输出长度"
            value={maxTokens}
            min={MAX_TOKENS_MIN}
            max={MAX_TOKENS_MAX}
            step={MAX_TOKENS_STEP}
            valueText={`${maxTokens} tokens`}
            leftHint={`${MAX_TOKENS_MIN}`}
            rightHint={`${MAX_TOKENS_MAX}`}
            disabled={disabled}
            onChange={onMaxTokensChange}
          />
          <p className="text-[11px] leading-5 text-slate-400">
            创意度越高内容越发散，越低越稳定严谨；输出长度限制单次生成的最大 token 数（1 个汉字约 1～1.5 个 token）。
          </p>
        </div>
      )}
    </div>
  );
}
