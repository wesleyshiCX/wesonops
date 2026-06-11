'use client';

import React, { useMemo, useReducer, useState } from 'react';
import { AlertTriangle, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import type { DashboardInputs, ProjectionMode } from '@/lib/llm-cost/types';
import { DEFAULT_INPUTS } from '@/lib/llm-cost/constants';
import { computeAllScenarios } from '@/lib/llm-cost/engine';
import InputsPanel from './InputsPanel';
import ResultsPanel from './ResultsPanel';
import ScenarioTable from './ScenarioTable';
import ExecSummary from './ExecSummary';

// ── Reducer: one typed patch action replaces 23 useState hooks ──────────────
type Action =
  | { type: 'patch'; key: keyof DashboardInputs; value: DashboardInputs[keyof DashboardInputs] }
  | { type: 'reset' };

function reducer(state: DashboardInputs, action: Action): DashboardInputs {
  switch (action.type) {
    case 'patch':
      return { ...state, [action.key]: action.value };
    case 'reset':
      return DEFAULT_INPUTS;
  }
}

type Tab = 'results' | 'scenarios' | 'brief';

const TABS: { id: Tab; label: string }[] = [
  { id: 'results', label: 'Results' },
  { id: 'scenarios', label: 'Scenario Comparison' },
  { id: 'brief', label: 'Executive Brief' },
];

const MODES: ProjectionMode[] = ['conservative', 'base', 'optimistic'];

export default function LLMCostDashboard() {
  const [inputs, dispatch] = useReducer(reducer, DEFAULT_INPUTS);
  const [tab, setTab] = useState<Tab>('results');
  const [boardMode, setBoardMode] = useState(false);

  const patch = <K extends keyof DashboardInputs>(key: K, value: DashboardInputs[K]) =>
    dispatch({ type: 'patch', key, value });

  // One memoized pass computes all three scenarios; the active one is a lookup.
  const allScenarios = useMemo(() => computeAllScenarios(inputs), [inputs]);
  const metrics = allScenarios[inputs.projectionMode];

  return (
    <div className="mx-auto w-full max-w-screen-2xl rounded-2xl border border-slate-800 bg-slate-950 p-6 font-sans text-slate-100 shadow-2xl">
      {/* ── HEADER ── */}
      <div className="mb-6 flex flex-col gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="mb-2 inline-block rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
            Total Economic Impact Model
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white">AI Deflection TCO Studio</h1>
          <p className="mt-1 max-w-xl text-xs text-slate-400">
            Direct savings with honest denominators. Extended TEI (churn, capacity) is reported
            separately — never blended into ROI.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Scenario toggle */}
          <div className="flex items-center gap-1 rounded-lg bg-slate-800 p-1">
            {MODES.map((mode) => (
              <button
                key={mode}
                onClick={() => patch('projectionMode', mode)}
                className={`rounded-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                  inputs.projectionMode === mode
                    ? mode === 'conservative'
                      ? 'border border-rose-500/30 bg-rose-500/20 text-rose-400'
                      : mode === 'optimistic'
                      ? 'border border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
                      : 'border border-slate-600 bg-slate-600/50 text-slate-200'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <button
            onClick={() => setBoardMode(!boardMode)}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all ${
              boardMode
                ? 'border-violet-500/30 bg-violet-500/20 text-violet-400'
                : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-300'
            }`}
          >
            {boardMode ? <PanelLeftOpen className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
            {boardMode ? 'Show Inputs' : 'Board Mode'}
          </button>
        </div>
      </div>

      {/* ── VALIDATION WARNINGS ── */}
      {metrics.warnings.length > 0 && (
        <div className="mb-6 space-y-2">
          {metrics.warnings.map((w, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 rounded-lg p-3 text-[11px] leading-relaxed ${
                w.severity === 'error'
                  ? 'border border-rose-500/20 bg-rose-500/10 text-rose-300'
                  : 'border border-amber-500/20 bg-amber-500/10 text-amber-300'
              }`}
            >
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                <strong className="uppercase tracking-wide">{w.field}: </strong>
                {w.message}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── MAIN LAYOUT ── */}
      <div className={`grid gap-6 ${boardMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'}`}>
        {!boardMode && (
          <div className="lg:col-span-4">
            <InputsPanel inputs={inputs} patch={patch} totalMonthlyInfraCost={metrics.totalMonthlyInfraCost} />
            <button
              onClick={() => dispatch({ type: 'reset' })}
              className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-800 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 transition-colors hover:text-slate-200"
            >
              Reset to Defaults
            </button>
          </div>
        )}

        <div className={boardMode ? 'col-span-full' : 'lg:col-span-8'}>
          {/* Tab bar */}
          <div className="mb-5 flex gap-1 rounded-lg bg-slate-900 p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 rounded-md px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all ${
                  tab === t.id
                    ? 'bg-slate-800 text-white shadow'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'results' && <ResultsPanel metrics={metrics} inputs={inputs} allScenarios={allScenarios} />}
          {tab === 'scenarios' && <ScenarioTable scenarios={allScenarios} activeMode={inputs.projectionMode} />}
          {tab === 'brief' && <ExecSummary metrics={metrics} inputs={inputs} />}
        </div>
      </div>
    </div>
  );
}
