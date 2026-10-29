import { useEffect, useRef, useState } from 'react';
import type { ModeId, WritingMode } from '../types';
import { MODE_ICONS, IconChevronDown } from './icons';

interface ModeSelectProps {
  modes: WritingMode[];
  value: ModeId;
  onChange: (id: ModeId) => void;
  disabled?: boolean;
}

export function ModeSelect({ modes, value, onChange, disabled }: ModeSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = modes.find((mode) => mode.id === value) ?? modes[0];
  const SelectedIcon = MODE_ICONS[selected.icon];

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left
          transition hover:border-indigo-300 hover:bg-indigo-50/40 focus:outline-none focus-visible:ring-2
          focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm">
          <SelectedIcon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-slate-800">{selected.label}</span>
          <span className="block truncate text-xs text-slate-500">{selected.hint}</span>
        </span>
        <IconChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-20 mt-2 max-h-72 w-full animate-fade-in overflow-y-auto rounded-xl border
            border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-300/40 scrollbar-slim"
        >
          {modes.map((mode) => {
            const Icon = MODE_ICONS[mode.icon];
            const active = mode.id === value;
            return (
              <li key={mode.id} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(mode.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition
                    ${active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <Icon className={active ? 'text-indigo-500' : 'text-slate-400'} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{mode.label}</span>
                    <span className="block truncate text-xs text-slate-500">{mode.hint}</span>
                  </span>
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
