'use client';

import React from 'react';
import { Cpu, Activity, Shield, TrendingUp } from 'lucide-react';
import type { DashboardInputs } from '@/lib/llm-cost/types';
import { LIMITS, LLM_MODELS, PRICING_AS_OF } from '@/lib/llm-cost/constants';
import { Collapsible, NumberInput, SectionHeader, SliderInput } from './controls';

type Patch = <K extends keyof DashboardInputs>(key: K, value: DashboardInputs[K]) => void;

export default function InputsPanel({
  inputs,
  patch,
  totalMonthlyInfraCost,
}: {
  inputs: DashboardInputs;
  patch: Patch;
  totalMonthlyInfraCost: number;
}) {
  return (
    <div className="space-y-4">
      {/* ── Core operations ── */}
      <div className="space-y-4 rounded-xl border border-slate-800/70 bg-slate-900/60 p-4">
        <SectionHeader
          icon={<Cpu className="h-4 w-4 text-emerald-400" />}
          title="Operations"
          subtitle="Volume and cost drivers"
        />
        <SliderInput
          label="Monthly Ticket Volume"
          value={inputs.ticketVolume}
          {...LIMITS.ticketVolume}
          onChange={(v) => patch('ticketVolume', v)}
          format={(v) => v.toLocaleString()}
          tooltip="Total monthly support tickets — the addressable universe for deflection."
        />
        <SliderInput
          label="Fully-Loaded Cost / Ticket"
          value={inputs.costPerLiveTicket}
          {...LIMITS.costPerLiveTicket}
          onChange={(v) => patch('costPerLiveTicket', v)}
          format={(v) => `$${v.toFixed(2)}`}
          tooltip="Agent salary + benefits + tooling + overhead per resolved ticket. HDI benchmark: $15–$25."
        />
        <SliderInput
          label="Target Deflection Rate"
          value={inputs.deflectionGoal}
          {...LIMITS.deflectionGoal}
          onChange={(v) => patch('deflectionGoal', v)}
          format={(v) => `${v}%`}
          accentClass="accent-cyan-500"
          tooltip="Tickets resolved without a human. Tier-1 automation benchmark: 40–60%."
          warning={
            inputs.deflectionGoal > LIMITS.deflectionGoal.warnAbove
              ? `>${LIMITS.deflectionGoal.warnAbove}% is uncommon — validate with pilot data.`
              : undefined
          }
        />
        <SliderInput
          label="Labor Capture Rate"
          value={inputs.laborCaptureRate}
          {...LIMITS.laborCaptureRate}
          onChange={(v) => patch('laborCaptureRate', v)}
          format={(v) => `${v}%`}
          accentClass="accent-amber-500"
          tooltip="Share of avoided handle-time you can actually bank as savings. Staffing isn't perfectly elastic — fractional hours don't convert to payroll reduction. Typical realization: 60–80%."
        />
        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Primary LLM Engine
          </label>
          <select
            value={inputs.selectedModelName}
            onChange={(e) => patch('selectedModelName', e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {LLM_MODELS.map((m) => (
              <option key={m.name} value={m.name}>
                {m.provider} — {m.name} ({m.tier})
              </option>
            ))}
          </select>
          <p className="mt-1 text-[9px] text-slate-600">Pricing as of {PRICING_AS_OF} — verify before presenting.</p>
        </div>
      </div>

      {/* ── Token model ── */}
      <Collapsible
        title="Token Model"
        subtitle="Conversation-history-aware session costing"
        icon={<Activity className="h-4 w-4 text-indigo-400" />}
      >
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="System + RAG Tokens"
            value={inputs.systemPromptTokens}
            onChange={(v) => patch('systemPromptTokens', v)}
            tooltip="System prompt and retrieved context, re-sent on every turn."
          />
          <NumberInput
            label="User Msg Tokens / Turn"
            value={inputs.userMessageTokens}
            onChange={(v) => patch('userMessageTokens', v)}
          />
          <NumberInput
            label="Completion Tokens / Turn"
            value={inputs.completionTokens}
            onChange={(v) => patch('completionTokens', v)}
          />
          <NumberInput
            label="Turns to Resolve"
            value={inputs.turnsToResolve}
            onChange={(v) => patch('turnsToResolve', v)}
            tooltip="Later turns carry the full conversation history in the prompt — session cost grows super-linearly with turns."
          />
          <NumberInput
            label="Turns to Escalate"
            value={inputs.turnsToEscalate}
            onChange={(v) => patch('turnsToEscalate', v)}
            tooltip="Tokens spent before human handoff are pure sunk cost."
          />
        </div>
        <SliderInput
          label="Token Overhead Multiplier"
          value={inputs.tokenOverheadMultiplier}
          {...LIMITS.tokenOverheadMultiplier}
          onChange={(v) => patch('tokenOverheadMultiplier', v)}
          format={(v) => `${v.toFixed(2)}×`}
          accentClass="accent-indigo-500"
          tooltip="Covers retries, guardrail/classification pre-flight calls, and eval traffic. 1.10–1.25 is typical in production."
        />
      </Collapsible>

      {/* ── Infrastructure ── */}
      <Collapsible
        title="Platform & Infrastructure"
        subtitle={`Current total: $${Math.round(totalMonthlyInfraCost).toLocaleString()}/mo`}
        icon={<Shield className="h-4 w-4 text-rose-400" />}
        defaultOpen
      >
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="Platform SaaS Fee /mo"
            value={inputs.monthlyPlatformFee}
            onChange={(v) => patch('monthlyPlatformFee', v)}
            prefix="$"
          />
          <NumberInput
            label="Implementation CapEx"
            value={inputs.implementationCost}
            onChange={(v) => patch('implementationCost', v)}
            prefix="$"
            tooltip="One-time build cost: integration, prompt engineering, KB prep, eval harness, security review. $25K–$150K is typical for production deployments."
          />
          <NumberInput
            label="Infra $ / 1K Tickets"
            value={inputs.infraPerThousandTickets}
            onChange={(v) => patch('infraPerThousandTickets', v)}
            prefix="$"
            tooltip="Volume-scaled costs: PII redaction, observability/logging, vector DB, HA fallback. These scale with traffic — flat monthly figures understate cost at volume."
          />
          <NumberInput
            label="Maintenance Rate $/hr"
            value={inputs.maintenanceHourlyRate}
            onChange={(v) => patch('maintenanceHourlyRate', v)}
            prefix="$"
          />
        </div>
        <SliderInput
          label="Maintenance FTE Fraction"
          value={inputs.maintenanceFteFraction}
          {...LIMITS.maintenanceFteFraction}
          onChange={(v) => patch('maintenanceFteFraction', v)}
          format={(v) => `${v.toFixed(2)} FTE`}
          accentClass="accent-rose-500"
          tooltip="Ongoing prompt tuning, KB curation, eval review, and drift monitoring. The single most-omitted cost in vendor ROI calculators. 0.5–1.0 FTE for 10K+ ticket/mo deployments."
        />
      </Collapsible>

      {/* ── Extended TEI ── */}
      <Collapsible
        title="Extended TEI Assumptions"
        subtitle="Churn & capacity — reported separately from ROI"
        icon={<TrendingUp className="h-4 w-4 text-cyan-400" />}
      >
        <NumberInput
          label="Customer Lifetime Value"
          value={inputs.customerLifetimeValue}
          onChange={(v) => patch('customerLifetimeValue', v)}
          prefix="$"
        />
        <SliderInput
          label="Baseline Monthly Churn"
          value={inputs.baselineChurnRatePct}
          {...LIMITS.baselineChurnRatePct}
          onChange={(v) => patch('baselineChurnRatePct', v)}
          format={(v) => `${v}%`}
          accentClass="accent-rose-500"
          tooltip="Anchors the at-risk pool — prevents CLV over-attribution."
        />
        <SliderInput
          label="AI Resolution CSAT"
          value={inputs.csatPct}
          {...LIMITS.csatPct}
          onChange={(v) => patch('csatPct', v)}
          format={(v) => `${v}%`}
          accentClass="accent-cyan-500"
          warning={
            inputs.csatPct <= LIMITS.csatPct.errorAtOrBelow
              ? `CSAT ≤${LIMITS.csatPct.errorAtOrBelow}% elevates churn risk — see warning banner.`
              : undefined
          }
        />
        <SliderInput
          label="Churn Attribution Factor"
          value={inputs.churnAttributionFactor}
          {...LIMITS.churnAttributionFactor}
          onChange={(v) => patch('churnAttributionFactor', v)}
          format={(v) => `${(v * 100).toFixed(0)}%`}
          accentClass="accent-purple-500"
          tooltip="Discounts for repeat contacts (same customer ≠ new save each month) and multi-cause churn. 0.3–0.6 is defensible; 1.0 will not survive finance review."
        />
        <SliderInput
          label="Avg Handle Time / Ticket"
          value={inputs.ahtMinutes}
          {...LIMITS.ahtMinutes}
          onChange={(v) => patch('ahtMinutes', v)}
          format={(v) => `${v} min`}
          accentClass="accent-purple-500"
        />
      </Collapsible>
    </div>
  );
}
