'use client';

import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Tooltip from './Tooltip';

export const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}> = ({ icon, title, subtitle }) => (
  <div className="mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
    {icon}
    <div>
      <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
      {subtitle && <p className="mt-0.5 text-[10px] text-slate-500">{subtitle}</p>}
    </div>
  </div>
);

export const SliderInput: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  accentClass?: string;
  tooltip?: string;
  warning?: string;
}> = ({ label, value, min, max, step, onChange, format, accentClass = 'accent-emerald-500', tooltip, warning }) => (
  <div>
    <div className="mb-1 flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</label>
        {tooltip && <Tooltip content={tooltip} />}
      </div>
      <span className="text-xs font-bold font-mono text-emerald-400">{format(value)}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 ${accentClass}`}
    />
    {warning && (
      <p className="mt-1 flex items-center gap-1 text-[9px] text-amber-400">
        <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
        {warning}
      </p>
    )}
  </div>
);

// String-buffered: the field is freely editable (including empty) while
// focused; the numeric value commits on blur. Fixes the "can't clear the
// input" fight caused by `parseFloat(...) || 0` on every keystroke.
export const NumberInput: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  tooltip?: string;
}> = ({ label, value, onChange, prefix, tooltip }) => {
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    if (draft !== null) {
      const parsed = parseFloat(draft);
      onChange(Number.isFinite(parsed) ? Math.max(0, parsed) : value);
      setDraft(null);
    }
  };

  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</label>
        {tooltip && <Tooltip content={tooltip} />}
      </div>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-500">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={draft ?? value}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && commit()}
          className={`w-full rounded border border-slate-700 bg-slate-800 px-2 py-1.5 font-mono text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 ${prefix ? 'pl-5' : ''}`}
        />
      </div>
    </div>
  );
};

export const Collapsible: React.FC<{
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, subtitle, icon, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800/70 bg-slate-900/60">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-slate-800/30"
      >
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <p className="text-sm font-semibold text-slate-200">{title}</p>
            {subtitle && <p className="text-[10px] text-slate-500">{subtitle}</p>}
          </div>
        </div>
        <span className="text-xs text-slate-500">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="space-y-4 border-t border-slate-800 px-4 pb-4 pt-4">{children}</div>}
    </div>
  );
};
