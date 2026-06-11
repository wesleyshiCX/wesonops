'use client';

import React, { useCallback, useState } from 'react';
import { Check, Copy, Presentation } from 'lucide-react';
import type { ComputedFinancials, DashboardInputs } from '@/lib/llm-cost/types';
import { fmt } from '@/lib/llm-cost/format';
import { getModel } from '@/lib/llm-cost/engine';

export default function ExecSummary({
  metrics,
  inputs,
}: {
  metrics: ComputedFinancials;
  inputs: DashboardInputs;
}) {
  const [copied, setCopied] = useState(false);
  const model = getModel(inputs.selectedModelName);

  const text = `
AI DEFLECTION TCO — EXECUTIVE BRIEF
Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Scenario: ${inputs.projectionMode.toUpperCase()} | Model: ${model.name}

DIRECT FINANCIALS (defensible, used in ROI)
───────────────────────────────────────────
Net Annual Savings:        ${fmt.usd(metrics.annualSavings)}
First-Year ROI:            ${fmt.pct(metrics.firstYearRoiPct)}
  (benefit ÷ [CapEx + 12mo operating cost])
CapEx Payback:             ${fmt.months(metrics.paybackMonths)}
Loaded Cost / Deflection:  ${fmt.usdCents(metrics.loadedCostPerDeflection)} vs ${fmt.usdCents(inputs.costPerLiveTicket)} human

MONTHLY COST COMPOSITION
───────────────────────────────────────────
Maintenance FTE:     ${fmt.usd(metrics.maintenanceCost)}
Platform SaaS:       ${fmt.usd(inputs.monthlyPlatformFee)}
Volume-Scaled Infra: ${fmt.usd(metrics.scaledInfraCost)}
LLM Tokens:          ${fmt.usd(metrics.monthlyTokenSpend)}
Total Monthly AI:    ${fmt.usd(metrics.totalMonthlyAICost)}

VOLUME (${inputs.projectionMode} scenario)
───────────────────────────────────────────
Monthly Volume:      ${fmt.num(inputs.ticketVolume)} tickets
Deflected:           ${fmt.num(metrics.deflections)} (${fmt.pct(metrics.effectiveDeflectionRate * 100)})
Labor Capture Rate:  ${inputs.laborCaptureRate}%

EXTENDED TEI (directional — excluded from ROI)
───────────────────────────────────────────
Churn Revenue Protected: ${fmt.usd(metrics.churnValueAnnual)}/yr (${(inputs.churnAttributionFactor * 100).toFixed(0)}% attribution)
Capacity Reclaimed:      ${fmt.ftes(metrics.ftesReclaimed)} FTE-equivalents/mo

NOTE: Projections are scenario-modeled estimates. Validate with 30-day pilot data.
`.trim();

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-5 py-3">
        <div className="flex items-center gap-2">
          <Presentation className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-semibold text-slate-200">Executive Brief</span>
          <span className="text-[10px] text-slate-500">— paste into deck or email</span>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-bold transition-all ${
            copied
              ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
              : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
          }`}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied!' : 'Copy Brief'}
        </button>
      </div>
      <pre className="max-h-96 overflow-x-auto whitespace-pre p-5 font-mono text-[10px] leading-relaxed text-slate-400">
        {text}
      </pre>
    </div>
  );
}
