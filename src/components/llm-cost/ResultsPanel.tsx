'use client';

import React, { useMemo } from 'react';
import {
  DollarSign, Zap, Percent, Cpu, AlertTriangle, Users, Target,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, ReferenceLine,
} from 'recharts';
import type { ComputedFinancials, DashboardInputs, ProjectionMode } from '@/lib/llm-cost/types';
import { fmt } from '@/lib/llm-cost/format';
import Tooltip from './Tooltip';

// ── Metric card — NOTE: no overflow-hidden, tooltip renders via portal ──────
const MetricCard: React.FC<{
  label: string;
  value: string;
  subtext?: string;
  icon: React.ReactNode;
  tooltip?: string;
  highlight?: boolean;
}> = ({ label, value, subtext, icon, tooltip, highlight }) => (
  <div
    className={`relative rounded-xl p-4 transition-all ${
      highlight
        ? 'border border-emerald-500/30 bg-emerald-950/40'
        : 'border border-slate-800 bg-slate-900 hover:border-slate-700'
    }`}
  >
    <div className="flex items-start justify-between">
      <span className="pr-2 text-xs font-semibold uppercase leading-tight tracking-wider text-slate-400">
        {label}
      </span>
      <div className="flex shrink-0 items-center gap-1.5">
        {tooltip && <Tooltip content={tooltip} />}
        {icon}
      </div>
    </div>
    <p className="mt-2 font-mono text-2xl font-bold leading-none text-white">{value}</p>
    {subtext && <p className="mt-1.5 text-[10px] text-slate-500">{subtext}</p>}
  </div>
);

const CostBar: React.FC<{ label: string; value: number; total: number; color: string }> = ({
  label, value, total, color,
}) => {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="mb-0.5 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">{label}</span>
        <span className="font-mono text-[10px] font-bold" style={{ color }}>
          {fmt.usd(value)}/mo · {pct.toFixed(0)}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
};

export default function ResultsPanel({
  metrics,
  inputs,
  allScenarios,
}: {
  metrics: ComputedFinancials;
  inputs: DashboardInputs;
  allScenarios: Record<ProjectionMode, ComputedFinancials>;
}) {
  const timeline = useMemo(() => {
    let legacy = 0;
    let hybrid = inputs.implementationCost;
    const monthlyHybrid =
      inputs.ticketVolume * inputs.costPerLiveTicket - metrics.grossLaborAvoided + metrics.totalMonthlyAICost;
    return Array.from({ length: 12 }, (_, i) => {
      legacy += inputs.ticketVolume * inputs.costPerLiveTicket;
      hybrid += monthlyHybrid;
      return {
        month: `M${i + 1}`,
        'Legacy Support ($)': Math.round(legacy),
        'AI Hybrid Ops ($)': Math.round(hybrid),
      };
    });
  }, [metrics, inputs]);

  const breakEvenMonth =
    metrics.paybackMonths !== Infinity && metrics.paybackMonths <= 12
      ? `M${Math.ceil(metrics.paybackMonths)}`
      : null;

  return (
    <div className="space-y-6">
      {/* ── HEADLINE KPIs ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="relative rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/60 to-slate-900 p-5">
          <div className="mb-1 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              Net Annual Savings
            </span>
            <Tooltip content="Captured labor avoidance minus ALL monthly AI costs (tokens + platform + scaled infra + maintenance FTE), annualized. This is the direct, defensible figure — extended TEI is reported separately below." />
          </div>
          <p className={`font-mono text-3xl font-black ${metrics.annualSavings >= 0 ? 'text-white' : 'text-rose-400'}`}>
            {fmt.usd(metrics.annualSavings)}
          </p>
          <p className="mt-1 text-[10px] text-emerald-400/70">{fmt.usd(metrics.monthlySavings)}/mo operational delta</p>
        </div>

        <div className="relative rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-950/60 to-slate-900 p-5">
          <div className="mb-1 flex items-center gap-2">
            <Percent className="h-4 w-4 text-amber-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">First-Year ROI</span>
            <Tooltip content="(12mo captured labor savings − total first-year cost) ÷ total first-year cost. The denominator includes CapEx AND 12 months of operating cost — the number a finance team will actually compute." />
          </div>
          <p className={`font-mono text-3xl font-black ${metrics.firstYearRoiPct >= 0 ? 'text-white' : 'text-rose-400'}`}>
            {fmt.pct(metrics.firstYearRoiPct)}
          </p>
          <div className="mt-2 flex gap-3 text-[9px]">
            <span className="text-rose-400">
              Worst: <span className="font-mono font-bold">{fmt.pct(allScenarios.conservative.firstYearRoiPct)}</span>
            </span>
            <span className="text-emerald-400">
              Best: <span className="font-mono font-bold">{fmt.pct(allScenarios.optimistic.firstYearRoiPct)}</span>
            </span>
          </div>
        </div>

        <div className="relative rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/60 to-slate-900 p-5">
          <div className="mb-1 flex items-center gap-2">
            <Zap className="h-4 w-4 text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">CapEx Payback</span>
            <Tooltip content="Implementation cost ÷ monthly net savings. Under 12 months is a strong CFO signal; 'N/A' means monthly savings are non-positive at these assumptions." />
          </div>
          <p className="font-mono text-3xl font-black text-white">{fmt.months(metrics.paybackMonths)}</p>
          <p className="mt-1 text-[10px] text-indigo-400/70">on {fmt.usd(inputs.implementationCost)} implementation CapEx</p>
        </div>
      </div>

      {/* ── UNIT ECONOMICS ── */}
      <div>
        <p className="mb-2 text-[9px] font-semibold uppercase tracking-widest text-slate-600">
          Unit Economics & Operations
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MetricCard
            label="Loaded Cost / Deflection"
            value={fmt.usdCents(metrics.loadedCostPerDeflection)}
            subtext={`vs. ${fmt.usdCents(inputs.costPerLiveTicket)} human fully-loaded`}
            icon={<Target className="h-4 w-4 text-sky-400" />}
            tooltip="All-in AI cost (tokens + platform + scaled infra + maintenance) ÷ deflected tickets. The honest procurement number."
          />
          <MetricCard
            label="Monthly Token Spend"
            value={fmt.usd(metrics.monthlyTokenSpend)}
            subtext={`${fmt.usdCents(metrics.costPerResolvedSession)} per resolved session`}
            icon={<Cpu className="h-4 w-4 text-indigo-400" />}
            tooltip="History-aware session costing with overhead multiplier. For Tier-1 models this is usually the SMALLEST cost component — infra and maintenance dominate."
          />
          <MetricCard
            label="Infra + Maintenance"
            value={fmt.usd(metrics.totalMonthlyInfraCost)}
            subtext={`incl. ${fmt.usd(metrics.maintenanceCost)} maintenance FTE`}
            icon={<Users className="h-4 w-4 text-rose-400" />}
            tooltip="Platform fee + volume-scaled compliance/observability + maintenance headcount. The costs vendor calculators omit."
          />
          <MetricCard
            label="Sunk Escalation Cost"
            value={fmt.usd(metrics.escalatedTokenSpend)}
            subtext={`${fmt.pct((metrics.escalatedTokenSpend / (metrics.monthlyTokenSpend || 1)) * 100)} of token budget`}
            icon={<AlertTriangle className="h-4 w-4 text-rose-400" />}
            tooltip="Tokens consumed by sessions that escalated to a human anyway. Reduce via better intent classification and confidence thresholds."
          />
        </div>
      </div>

      {/* ── COST COMPOSITION ── */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <h3 className="mb-1 text-sm font-semibold text-slate-200">Monthly AI Cost Composition</h3>
        <p className="mb-4 text-[10px] text-slate-500">
          Total: <span className="font-mono font-bold text-white">{fmt.usd(metrics.totalMonthlyAICost)}/mo</span> — note
          where the money actually goes (hint: rarely tokens)
        </p>
        <div className="space-y-3">
          <CostBar label="Maintenance FTE" value={metrics.maintenanceCost} total={metrics.totalMonthlyAICost} color="#fb7185" />
          <CostBar label="Platform SaaS" value={inputs.monthlyPlatformFee} total={metrics.totalMonthlyAICost} color="#818cf8" />
          <CostBar label="Volume-Scaled Infra" value={metrics.scaledInfraCost} total={metrics.totalMonthlyAICost} color="#fbbf24" />
          <CostBar label="Tokens — Resolved" value={metrics.resolvedTokenSpend} total={metrics.totalMonthlyAICost} color="#38bdf8" />
          <CostBar label="Tokens — Sunk (Escalated)" value={metrics.escalatedTokenSpend} total={metrics.totalMonthlyAICost} color="#f43f5e" />
        </div>
      </div>

      {/* ── 12-MONTH TCO CHART ── */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <h3 className="text-sm font-semibold text-slate-200">12-Month Cumulative TCO vs. Legacy Baseline</h3>
        <p className="mb-4 mt-0.5 text-[10px] text-slate-500">
          CapEx front-loaded at M1 · {breakEvenMonth ? `Break-even at ${breakEvenMonth}` : 'Break-even not reached in 12 months'}
        </p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradLegacy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradAI" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#475569" fontSize={10} tickLine={false} />
              <YAxis stroke="#475569" fontSize={10} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <RechartsTooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 11 }}
                formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, '']}
              />
              <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              {breakEvenMonth && (
                <ReferenceLine
                  x={breakEvenMonth}
                  stroke="#f59e0b"
                  strokeDasharray="4 2"
                  label={{ value: 'Break-Even', position: 'top', fill: '#f59e0b', fontSize: 9 }}
                />
              )}
              <Area type="monotone" dataKey="Legacy Support ($)" stroke="#f43f5e" fill="url(#gradLegacy)" strokeWidth={2} />
              <Area type="monotone" dataKey="AI Hybrid Ops ($)" stroke="#10b981" fill="url(#gradAI)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── EXTENDED TEI — explicitly fenced off from ROI ── */}
      <div className="rounded-xl border border-cyan-500/20 bg-slate-900/40 p-5">
        <div className="mb-3 flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-200">Extended TEI — Strategic Value</h3>
          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-cyan-400">
            Excluded from ROI
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
            <p className="text-[10px] uppercase tracking-widest text-slate-500">Churn Revenue Protected</p>
            <p className="mt-1 font-mono text-lg font-bold text-cyan-400">{fmt.usd(metrics.churnValueAnnual)}/yr</p>
            <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
              ≈{metrics.customersSavedPerMonth.toFixed(1)} customers/mo retained. Anchored to baseline churn and
              discounted by a {(inputs.churnAttributionFactor * 100).toFixed(0)}% attribution factor. Treat as
              directional — not bookable savings.
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
            <p className="text-[10px] uppercase tracking-widest text-slate-500">Capacity Reclaimed</p>
            <p className="mt-1 font-mono text-lg font-bold text-violet-400">{fmt.ftes(metrics.ftesReclaimed)} FTE-equiv</p>
            <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
              {fmt.num(metrics.hoursReclaimedMonthly)} hrs/mo redirectable to escalation quality and CX work. This is the
              same labor already counted in direct savings — expressed as capacity, never added as dollars.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
