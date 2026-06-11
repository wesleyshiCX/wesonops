'use client';

import React from 'react';
import type { ComputedFinancials, ProjectionMode } from '@/lib/llm-cost/types';
import { fmt } from '@/lib/llm-cost/format';

const MODES: ProjectionMode[] = ['conservative', 'base', 'optimistic'];

const MODE_LABEL: Record<ProjectionMode, string> = {
  conservative: '⚠ Conservative',
  base: '◎ Base',
  optimistic: '✓ Optimistic',
};

const MODE_COLOR: Record<ProjectionMode, string> = {
  conservative: 'text-rose-300',
  base: 'text-slate-200',
  optimistic: 'text-emerald-300',
};

export default function ScenarioTable({
  scenarios,
  activeMode,
}: {
  scenarios: Record<ProjectionMode, ComputedFinancials>;
  activeMode: ProjectionMode;
}) {
  const rows: { label: string; get: (m: ComputedFinancials) => string; highlight?: boolean }[] = [
    { label: 'Effective Deflection Rate', get: (m) => fmt.pct(m.effectiveDeflectionRate * 100) },
    { label: 'Deflected Tickets / Mo', get: (m) => fmt.num(m.deflections) },
    { label: 'Monthly Net Savings', get: (m) => fmt.usd(m.monthlySavings), highlight: true },
    { label: 'Annual Net Savings', get: (m) => fmt.usd(m.annualSavings), highlight: true },
    { label: 'First-Year ROI', get: (m) => fmt.pct(m.firstYearRoiPct), highlight: true },
    { label: 'CapEx Payback', get: (m) => fmt.months(m.paybackMonths) },
    { label: 'Loaded Cost / Deflection', get: (m) => fmt.usdCents(m.loadedCostPerDeflection) },
    { label: 'Churn Value (excl. ROI)', get: (m) => `${fmt.usd(m.churnValueAnnual)}/yr` },
    { label: 'FTE Capacity Reclaimed', get: (m) => fmt.ftes(m.ftesReclaimed) },
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40 p-5">
      <h3 className="mb-1 text-sm font-semibold text-slate-200">Scenario Comparison</h3>
      <p className="mb-4 text-[10px] text-slate-500">
        Conservative ×0.75 / Base ×1.0 / Optimistic ×1.15 applied to deflection rate — once, in one place.
      </p>
      <table className="w-full text-[11px]">
        <thead>
          <tr className="border-b border-slate-800">
            <th className="w-44 py-2 pr-4 text-left font-semibold uppercase tracking-wider text-slate-500">Metric</th>
            {MODES.map((mode) => (
              <th key={mode} className={`py-2 px-3 text-right font-bold uppercase tracking-wider ${MODE_COLOR[mode]}`}>
                {MODE_LABEL[mode]}
                {activeMode === mode && <span className="ml-1 text-[8px] text-slate-500">(active)</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className={`border-b border-slate-800/50 ${row.highlight ? 'bg-slate-900/60' : ''}`}>
              <td className="py-2.5 pr-4 font-medium text-slate-400">{row.label}</td>
              {MODES.map((mode) => (
                <td
                  key={mode}
                  className={`py-2.5 px-3 text-right font-mono font-bold ${
                    row.highlight ? MODE_COLOR[mode] : 'text-slate-400'
                  } ${activeMode === mode ? 'rounded bg-slate-800/40' : ''}`}
                >
                  {row.get(scenarios[mode])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
