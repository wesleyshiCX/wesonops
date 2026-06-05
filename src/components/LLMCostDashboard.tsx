// ============================================================================
// FILE: LLMCostDashboard.tsx
// TYPE: Production React Component (TypeScript)
// PURPOSE: Total Economic Impact (TEI) Platform for AI Deflection ROI
// ARCHITECTURE: Decoupled computation engine + clean UI render layer
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  Percent,
  Cpu,
  Info,
  Zap,
  AlertTriangle,
  FileText,
  Users,
  Shield,
  BarChart2,
  ChevronDown,
  ChevronUp,
  Activity,
  RefreshCw,
  Eye,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ZAxis,
  LabelList,
} from 'recharts';

// ============================================================================
// SECTION 1: TYPE DEFINITIONS
// ============================================================================

interface LLMModel {
  name: string;
  provider: string;
  inputCostPer1M: number;
  outputCostPer1M: number;
  averageLatencySeconds: number;
  tier: 'Tier 1 (Fast/Cheap)' | 'Tier 2 (Balanced)' | 'Tier 3 (Reasoning/Complex)';
}

interface DashboardInputs {
  ticketVolume: number;
  costPerLiveTicket: number;
  deflectionGoal: number;
  selectedModelName: string;
  avgPromptTokens: number;
  avgCompletionTokens: number;
  avgTurnsPerResolved: number;
  avgTurnsBeforeEscalation: number;
  monthlyPlatformFee: number;
  implementationCost: number;
  customerLifetimeValue: number;
  baselineChurnRate: number;
  resolutionSatisfactionScore: number;
  avgHandlingTimeMinutes: number;
  internalDevHourlyRate: number;
  productiveHoursPerMonth: number;
  piiRedactionCost: number;
  observabilityCost: number;
  haFallbackCost: number;
  accuracyVariancePct: number;
  churnSensitivity: number;
  projectionMode: 'conservative' | 'base' | 'optimistic';
}

interface ComputedFinancials {
  targetDeflections: number;
  targetEscalations: number;
  adjustedDeflections: number;
  successfulTokensCost: number;
  nonDeflectedSunkTokensCost: number;
  monthlyTotalTokenSpent: number;
  totalMonthlyInfraCost: number;
  totalMonthlyAICost: number;
  pureHumanCost: number;
  hybridHumanCost: number;
  totalHybridCost: number;
  monthlySavings: number;
  annualSavings: number;
  rawRoiPct: number;
  trueLoadedCostPerDeflection: number;
  breakEvenMonths: number;
  churnSavedRevenue: number;
  annualChurnSavedRevenue: number;
  monthlyManualHoursSaved: number;
  ftesReclaimed: number;
  engineeringOpportunityCost: number;
  totalMonthlyEconomicValue: number;
  totalAnnualEconomicValue: number;
  riskAdjustedRoi: number;
  monthlyInfraBreakdown: {
    platform: number;
    piiRedaction: number;
    observability: number;
    haFallback: number;
  };
}

// ============================================================================
// SECTION 2: CONSTANTS & MODEL REGISTRY
// ============================================================================

const LLM_MODELS: LLMModel[] = [
  {
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.30,
    averageLatencySeconds: 0.8,
    tier: 'Tier 1 (Fast/Cheap)',
  },
  {
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.60,
    averageLatencySeconds: 1.0,
    tier: 'Tier 1 (Fast/Cheap)',
  },
  {
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    inputCostPer1M: 0.80,
    outputCostPer1M: 4.00,
    averageLatencySeconds: 1.2,
    tier: 'Tier 2 (Balanced)',
  },
  {
    name: 'GPT-4o',
    provider: 'OpenAI',
    inputCostPer1M: 2.50,
    outputCostPer1M: 10.00,
    averageLatencySeconds: 2.1,
    tier: 'Tier 3 (Reasoning/Complex)',
  },
  {
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    inputCostPer1M: 3.00,
    outputCostPer1M: 15.00,
    averageLatencySeconds: 2.3,
    tier: 'Tier 3 (Reasoning/Complex)',
  },
];

const PRODUCTIVE_HOURS_DEFAULT = 160;

const SCENARIO_MULTIPLIERS = {
  conservative: 0.75,
  base: 1.0,
  optimistic: 1.20,
} as const;

// ============================================================================
// SHARED CHART HELPERS
// Recharts internally types array values as readonly. The formatter must
// accept ReadonlyArray to satisfy the Formatter<ValueType, NameType> constraint.
// ============================================================================

type RechartsValueType =
  | number
  | string
  | readonly (string | number)[]
  | undefined;

const chartCurrencyFormatter = (
  value: RechartsValueType
): [string, string] => {
  const num = typeof value === 'number' ? value : Number(value ?? 0);
  return [`$${num.toLocaleString()}`, ''];
};
========================
// ============================================================================
// SHARED CHART HELPERS
// Recharts internally types array values as readonly. The formatter must
// accept ReadonlyArray to satisfy the Formatter<ValueType, NameType> constraint.
// ============================================================================

type RechartsValueType =
  | number
  | string
  | readonly (string | number)[]
  | undefined;

const chartCurrencyFormatter = (
  value: RechartsValueType
): [string, string] => {
  const num = typeof value === 'number' ? value : Number(value ?? 0);
  return [`$${num.toLocaleString()}`, ''];
};

// ============================================================================
// SHARED CHART HELPERS
// Recharts internally types array values as readonly. The formatter must
// accept ReadonlyArray to satisfy the Formatter<ValueType, NameType> constraint.
// ============================================================================

type RechartsValueType =
  | number
  | string
  | readonly (string | number)[]
  | undefined;

const chartCurrencyFormatter = (
  value: RechartsValueType
): [string, string] => {
  const num = typeof value === 'number' ? value : Number(value ?? 0);
  return [`$${num.toLocaleString()}`, ''];
};
helper provides a
// ============================================================================
// SHARED CHART HELPERS
// Recharts internally types array values as readonly. The formatter must
// accept ReadonlyArray to satisfy the Formatter<ValueType, NameType> constraint.
// ============================================================================

type RechartsValueType =
  | number
  | string
  | readonly (string | number)[]
  | undefined;

const chartCurrencyFormatter = (
  value: RechartsValueType
): [string, string] => {
  const num = typeof value === 'number' ? value : Number(value ?? 0);
  return [`$${num.toLocaleString()}`, ''];
};
ltip formatter props.
// ============================================================================
// SHARED CHART HELPERS
// Recharts internally types array values as readonly. The formatter must
// accept ReadonlyArray to satisfy the Formatter<ValueType, NameType> constraint.
// ============================================================================

type RechartsValueType =
  | number
  | string
  | readonly (string | number)[]
  | undefined;

const chartCurrencyFormatter = (
  value: RechartsValueType
): [string, string] => {
  const num = typeof value === 'number' ? value : Number(value ?? 0);
  return [`$${num.toLocaleString()}`, ''];
};
========================
// ============================================================================
// SHARED CHART HELPERS
// Recharts internally types array values as readonly. The formatter must
// accept ReadonlyArray to satisfy the Formatter<ValueType, NameType> constraint.
// ============================================================================

type RechartsValueType =
  | number
  | string
  | readonly (string | number)[]
  | undefined;

const chartCurrencyFormatter = (
  value: RechartsValueType
): [string, string] => {
  const num = typeof value === 'number' ? value : Number(value ?? 0);
  return [`$${num.toLocaleString()}`, ''];
};

// ============================================================================
// SHARED CHART HELPERS
// Recharts internally types array values as readonly. The formatter must
// accept ReadonlyArray to satisfy the Formatter<ValueType, NameType> constraint.
// ============================================================================

type RechartsValueType =
  | number
  | string
  | readonly (string | number)[]
  | undefined;

const chartCurrencyFormatter = (
  value: RechartsValueType
): [string, string] => {
  const num = typeof value === 'number' ? value : Number(value ?? 0);
  return [`$${num.toLocaleString()}`, ''];
};
 | string> | undefined;
// ============================================================================
// SHARED CHART HELPERS
// Recharts internally types array values as readonly. The formatter must
// accept ReadonlyArray to satisfy the Formatter<ValueType, NameType> constraint.
// ============================================================================

type RechartsValueType =
  | number
  | string
  | readonly (string | number)[]
  | undefined;

const chartCurrencyFormatter = (
  value: RechartsValueType
): [string, string] => {
  const num = typeof value === 'number' ? value : Number(value ?? 0);
  return [`$${num.toLocaleString()}`, ''];
};

// ============================================================================
// SHARED CHART HELPERS
// Recharts internally types array values as readonly. The formatter must
// accept ReadonlyArray to satisfy the Formatter<ValueType, NameType> constraint.
// ============================================================================

type RechartsValueType =
  | number
  | string
  | readonly (string | number)[]
  | undefined;

const chartCurrencyFormatter = (
  value: RechartsValueType
): [string, string] => {
  const num = typeof value === 'number' ? value : Number(value ?? 0);
  return [`$${num.toLocaleString()}`, ''];
};

// ============================================================================
// SHARED CHART HELPERS
// Recharts internally types array values as readonly. The formatter must
// accept ReadonlyArray to satisfy the Formatter<ValueType, NameType> constraint.
// ============================================================================

type RechartsValueType =
  | number
  | string
  | readonly (string | number)[]
  | undefined;

const chartCurrencyFormatter = (
  value: RechartsValueType
): [string, string] => {
  const num = typeof value === 'number' ? value : Number(value ?? 0);
  return [`$${num.toLocaleString()}`, ''];
};

// ============================================================================
// SHARED CHART HELPERS
// Recharts internally types array values as readonly. The formatter must
// accept ReadonlyArray to satisfy the Formatter<ValueType, NameType> constraint.
// ============================================================================

type RechartsValueType =
  | number
  | string
  | readonly (string | number)[]
  | undefined;

const chartCurrencyFormatter = (
  value: RechartsValueType
): [string, string] => {
  const num = typeof value === 'number' ? value : Number(value ?? 0);
  return [`$${num.toLocaleString()}`, ''];
};
matter props.
// ============================================================================
// SHARED CHART HELPERS
// Recharts internally types array values as readonly. The formatter must
// accept ReadonlyArray to satisfy the Formatter<ValueType, NameType> constraint.
// ============================================================================

type RechartsValueType =
  | number
  | string
  | readonly (string | number)[]
  | undefined;

const chartCurrencyFormatter = (
  value: RechartsValueType
): [string, string] => {
  const num = typeof value === 'number' ? value : Number(value ?? 0);
  return [`$${num.toLocaleString()}`, ''];
};
nternal typing.
// ============================================================================
// SHARED CHART HELPERS
// Recharts internally types array values as readonly. The formatter must
// accept ReadonlyArray to satisfy the Formatter<ValueType, NameType> constraint.
// ============================================================================

type RechartsValueType =
  | number
  | string
  | readonly (string | number)[]
  | undefined;

const chartCurrencyFormatter = (
  value: RechartsValueType
): [string, string] => {
  const num = typeof value === 'number' ? value : Number(value ?? 0);
  return [`$${num.toLocaleString()}`, ''];
};

// ============================================================================
// SHARED CHART HELPERS
// Recharts internally types array values as readonly. The formatter must
// accept ReadonlyArray to satisfy the Formatter<ValueType, NameType> constraint.
// ============================================================================

type RechartsValueType =
  | number
  | string
  | readonly (string | number)[]
  | undefined;

const chartCurrencyFormatter = (
  value: RechartsValueType
): [string, string] => {
  const num = typeof value === 'number' ? value : Number(value ?? 0);
  return [`$${num.toLocaleString()}`, ''];
};

// ============================================================================
// SHARED CHART HELPERS
// Recharts internally types array values as readonly. The formatter must
// accept ReadonlyArray to satisfy the Formatter<ValueType, NameType> constraint.
// ============================================================================

type RechartsValueType =
  | number
  | string
  | readonly (string | number)[]
  | undefined;

const chartCurrencyFormatter = (
  value: RechartsValueType
): [string, string] => {
  const num = typeof value === 'number' ? value : Number(value ?? 0);
  return [`$${num.toLocaleString()}`, ''];
};

// ============================================================================
// SHARED CHART HELPERS
// Recharts internally types array values as readonly. The formatter must
// accept ReadonlyArray to satisfy the Formatter<ValueType, NameType> constraint.
// ============================================================================

type RechartsValueType =
  | number
  | string
  | readonly (string | number)[]
  | undefined;

const chartCurrencyFormatter = (
  value: RechartsValueType
): [string, string] => {
  const num = typeof value === 'number' ? value : Number(value ?? 0);
  return [`$${num.toLocaleString()}`, ''];
};

// ============================================================================
// SHARED CHART HELPERS
// Recharts internally types array values as readonly. The formatter must
// accept ReadonlyArray to satisfy the Formatter<ValueType, NameType> constraint.
// ============================================================================

type RechartsValueType =
  | number
  | string
  | readonly (string | number)[]
  | undefined;

const chartCurrencyFormatter = (
  value: RechartsValueType
): [string, string] => {
  const num = typeof value === 'number' ? value : Number(value ?? 0);
  return [`$${num.toLocaleString()}`, ''];
};
r(value ?? 0);
// ============================================================================
// SHARED CHART HELPERS
// Recharts internally types array values as readonly. The formatter must
// accept ReadonlyArray to satisfy the Formatter<ValueType, NameType> constraint.
// ============================================================================

type RechartsValueType =
  | number
  | string
  | readonly (string | number)[]
  | undefined;

const chartCurrencyFormatter = (
  value: RechartsValueType
): [string, string] => {
  const num = typeof value === 'number' ? value : Number(value ?? 0);
  return [`$${num.toLocaleString()}`, ''];
};

// ============================================================================
// SHARED CHART HELPERS
// Recharts internally types array values as readonly. The formatter must
// accept ReadonlyArray to satisfy the Formatter<ValueType, NameType> constraint.
// ============================================================================

type RechartsValueType =
  | number
  | string
  | readonly (string | number)[]
  | undefined;

const chartCurrencyFormatter = (
  value: RechartsValueType
): [string, string] => {
  const num = typeof value === 'number' ? value : Number(value ?? 0);
  return [`$${num.toLocaleString()}`, ''];
};

// ============================================================================
// SHARED CHART HELPERS
// Recharts internally types array values as readonly. The formatter must
// accept ReadonlyArray to satisfy the Formatter<ValueType, NameType> constraint.
// ============================================================================

type RechartsValueType =
  | number
  | string
  | readonly (string | number)[]
  | undefined;

const chartCurrencyFormatter = (
  value: RechartsValueType
): [string, string] => {
  const num = typeof value === 'number' ? value : Number(value ?? 0);
  return [`$${num.toLocaleString()}`, ''];
};

// ============================================================================
// SECTION 3: COMPUTATION ENGINE (Decoupled from UI)
// ============================================================================

function computeFinancials(
  inputs: DashboardInputs,
  selectedModel: LLMModel
): ComputedFinancials {
  const {
    ticketVolume,
    costPerLiveTicket,
    deflectionGoal,
    avgPromptTokens,
    avgCompletionTokens,
    avgTurnsPerResolved,
    avgTurnsBeforeEscalation,
    monthlyPlatformFee,
    implementationCost,
    customerLifetimeValue,
    resolutionSatisfactionScore,
    avgHandlingTimeMinutes,
    internalDevHourlyRate,
    productiveHoursPerMonth,
    piiRedactionCost,
    observabilityCost,
    haFallbackCost,
    accuracyVariancePct,
    churnSensitivity,
    projectionMode,
  } = inputs;

  // BLOCK A: Scenario Adjustment
  const scenarioMultiplier = SCENARIO_MULTIPLIERS[projectionMode];
  const varianceMultiplier = 1 + accuracyVariancePct / 100;
  const effectiveDeflectionRate = Math.min(
    0.95,
    Math.max(0, (deflectionGoal / 100) * scenarioMultiplier * varianceMultiplier)
  );

  // BLOCK B: Volume Calculations
  const targetDeflections = Math.round(ticketVolume * (deflectionGoal / 100));
  const adjustedDeflections = Math.round(ticketVolume * effectiveDeflectionRate);
  const targetEscalations = ticketVolume - adjustedDeflections;

  // BLOCK C: Token Cost Layer
  const inputCostPerToken = selectedModel.inputCostPer1M / 1_000_000;
  const outputCostPerToken = selectedModel.outputCostPer1M / 1_000_000;
  const singleTurnCost =
    avgPromptTokens * inputCostPerToken + avgCompletionTokens * outputCostPerToken;
  const costPerSuccessfulSession = singleTurnCost * avgTurnsPerResolved;
  const costPerEscalatedSession = singleTurnCost * avgTurnsBeforeEscalation;
  const successfulTokensCost = adjustedDeflections * costPerSuccessfulSession;
  const nonDeflectedSunkTokensCost = targetEscalations * costPerEscalatedSession;
  const monthlyTotalTokenSpent = successfulTokensCost + nonDeflectedSunkTokensCost;

  // BLOCK D: Production Infrastructure & Compliance Costs
  const monthlyInfraBreakdown = {
    platform: monthlyPlatformFee,
    piiRedaction: piiRedactionCost,
    observability: observabilityCost,
    haFallback: haFallbackCost,
  };
  const totalMonthlyInfraCost =
    monthlyPlatformFee + piiRedactionCost + observabilityCost + haFallbackCost;
  const totalMonthlyAICost = monthlyTotalTokenSpent + totalMonthlyInfraCost;

  // BLOCK E: Human Cost Baseline vs. Hybrid Model
  const pureHumanCost = ticketVolume * costPerLiveTicket;
  const hybridHumanCost = targetEscalations * costPerLiveTicket;
  const totalHybridCost = hybridHumanCost + totalMonthlyAICost;

  // BLOCK F: Primary Financial Outputs
  const monthlySavings = pureHumanCost - totalHybridCost;
  const annualSavings = monthlySavings * 12;
  const rawRoiPct =
    totalHybridCost > 0 ? (monthlySavings / totalHybridCost) * 100 : 0;
  const trueLoadedCostPerDeflection =
    adjustedDeflections > 0 ? totalMonthlyAICost / adjustedDeflections : 0;
  const breakEvenMonths =
    monthlySavings > 0
      ? Number((implementationCost / monthlySavings).toFixed(1))
      : Infinity;

  // BLOCK G: TEI — Churn Impact
  // Formula: Deflections × (1 - SatisfactionScore) × CLV × ChurnSensitivity
  const dissatisfiedResolutionRate = Math.max(0, 1 - resolutionSatisfactionScore);
  const churnPrevented = adjustedDeflections * dissatisfiedResolutionRate * churnSensitivity;
  const churnSavedRevenue = churnPrevented * customerLifetimeValue;
  const annualChurnSavedRevenue = churnSavedRevenue * 12;

  // BLOCK H: TEI — Engineering Reinvestment
  // Formula: FTEs = (Deflections × AHT / 60) / ProductiveHoursPerMonth
  const monthlyManualHoursSaved = (adjustedDeflections * avgHandlingTimeMinutes) / 60;
  const ftesReclaimed =
    productiveHoursPerMonth > 0 ? monthlyManualHoursSaved / productiveHoursPerMonth : 0;
  const engineeringOpportunityCost =
    ftesReclaimed * internalDevHourlyRate * productiveHoursPerMonth;

  // BLOCK I: TEI Composite
  const totalMonthlyEconomicValue =
    monthlySavings + churnSavedRevenue + engineeringOpportunityCost;
  const totalAnnualEconomicValue = totalMonthlyEconomicValue * 12;

  // BLOCK J: Risk-Adjusted ROI
  // Formula: (TEI Annual × ScenarioMultiplier - CapEx) / CapEx × 100
  const riskAdjustedRoi =
    implementationCost > 0
      ? ((totalAnnualEconomicValue * scenarioMultiplier - implementationCost) /
          implementationCost) *
        100
      : 0;

  return {
    targetDeflections,
    adjustedDeflections,
    targetEscalations,
    successfulTokensCost,
    nonDeflectedSunkTokensCost,
    monthlyTotalTokenSpent,
    totalMonthlyInfraCost,
    totalMonthlyAICost,
    pureHumanCost,
    hybridHumanCost,
    totalHybridCost,
    monthlySavings,
    annualSavings,
    rawRoiPct,
    trueLoadedCostPerDeflection,
    breakEvenMonths,
    churnSavedRevenue,
    annualChurnSavedRevenue,
    monthlyManualHoursSaved,
    ftesReclaimed,
    engineeringOpportunityCost,
    totalMonthlyEconomicValue,
    totalAnnualEconomicValue,
    riskAdjustedRoi,
    monthlyInfraBreakdown,
  };
}

// ============================================================================
// SECTION 4: UI SUB-COMPONENTS
// ============================================================================

type MetricBadge = 'Financial Projection' | 'Operational Metric';

interface MetricCardProps {
  label: string;
  value: string;
  subtext?: string;
  icon: React.ReactNode;
  accentColor: string;
  badgeType: MetricBadge;
  tooltip?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  icon,
  accentColor,
  badgeType,
  tooltip,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const badgeColor =
    badgeType === 'Financial Projection'
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';

  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden group">
      <span
        className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-full border mb-2 ${badgeColor}`}
      >
        {badgeType}
      </span>
      <div className="flex justify-between items-start">
        <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 leading-tight pr-2">
          {label}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {tooltip && (
            <div className="relative">
              <Info
                className="w-3.5 h-3.5 text-slate-600 cursor-help hover:text-slate-400 transition-colors"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              />
              {showTooltip && (
                <div className="absolute right-0 bottom-full mb-2 w-56 bg-slate-800 border border-slate-700 rounded-lg p-3 text-[11px] text-slate-300 leading-relaxed z-50 shadow-xl">
                  {tooltip}
                </div>
              )}
            </div>
          )}
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold font-mono mt-2 text-white">{value}</p>
      {subtext && <p className="text-[10px] text-slate-500 mt-1">{subtext}</p>}
      <div className={`absolute bottom-0 right-0 left-0 h-0.5 bg-gradient-to-r ${accentColor}`} />
    </div>
  );
};

const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}> = ({ icon, title, subtitle }) => (
  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
    <div className="flex items-center gap-2">
      {icon}
      <div>
        <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
        {subtitle && <p className="text-[10px] text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  </div>
);

const SliderInput: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  accentClass?: string;
  tooltip?: string;
}> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  accentClass = 'accent-emerald-500',
  tooltip,
}) => {
  const [showTip, setShowTip] = useState(false);
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </label>
          {tooltip && (
            <div className="relative">
              <Info
                className="w-3 h-3 text-slate-600 cursor-help"
                onMouseEnter={() => setShowTip(true)}
                onMouseLeave={() => setShowTip(false)}
              />
              {showTip && (
                <div className="absolute left-0 bottom-full mb-2 w-52 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-[10px] text-slate-300 leading-relaxed z-50 shadow-xl">
                  {tooltip}
                </div>
              )}
            </div>
          )}
        </div>
        <span className="text-xs font-mono text-emerald-400 font-bold">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer ${accentClass}`}
      />
    </div>
  );
};

const NumberInput: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  tooltip?: string;
  textColor?: string;
}> = ({ label, value, onChange, prefix, tooltip, textColor = 'text-slate-200' }) => {
  const [showTip, setShowTip] = useState(false);
  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        <label className="block text-[10px] uppercase font-bold text-slate-400">{label}</label>
        {tooltip && (
          <div className="relative">
            <Info
              className="w-3 h-3 text-slate-600 cursor-help"
              onMouseEnter={() => setShowTip(true)}
              onMouseLeave={() => setShowTip(false)}
            />
            {showTip && (
              <div className="absolute left-0 bottom-full mb-2 w-52 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-[10px] text-slate-300 leading-relaxed z-50 shadow-xl">
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="relative">
        {prefix && (
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Math.max(0, parseFloat(e.target.value) || 0))}
          className={`w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm ${textColor} font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/50 ${
            prefix ? 'pl-5' : ''
          }`}
        />
      </div>
    </div>
  );
};

// ============================================================================
// SECTION 5: MAIN DASHBOARD COMPONENT
// ============================================================================

export default function LLMCostDashboard() {
  // Core Operational Inputs
  const [ticketVolume, setTicketVolume] = useState<number>(12000);
  const [costPerLiveTicket, setCostPerLiveTicket] = useState<number>(18.5);
  const [deflectionGoal, setDeflectionGoal] = useState<number>(45);
  const [selectedModelName, setSelectedModelName] = useState<string>('GPT-4o Mini');

  // Token Simulation
  const [avgPromptTokens, setAvgPromptTokens] = useState<number>(650);
  const [avgCompletionTokens, setAvgCompletionTokens] = useState<number>(250);
  const [avgTurnsPerResolved, setAvgTurnsPerResolved] = useState<number>(4);
  const [avgTurnsBeforeEscalation, setAvgTurnsBeforeEscalation] = useState<number>(2);

  // Platform & CapEx
  const [monthlyPlatformFee, setMonthlyPlatformFee] = useState<number>(1500);
  const [implementationCost, setImplementationCost] = useState<number>(8000);

  // Production Infrastructure & Compliance
  const [piiRedactionCost, setPiiRedactionCost] = useState<number>(400);
  const [observabilityCost, setObservabilityCost] = useState<number>(300);
  const [haFallbackCost, setHaFallbackCost] = useState<number>(250);
  const [showInfraPanel, setShowInfraPanel] = useState<boolean>(true);

  // TEI: Churn Impact
  const [customerLifetimeValue, setCustomerLifetimeValue] = useState<number>(1200);
  const [baselineChurnRate, setBaselineChurnRate] = useState<number>(5);
  const [resolutionSatisfactionScore, setResolutionSatisfactionScore] = useState<number>(82);

  // TEI: Engineering Reinvestment
  const [avgHandlingTimeMinutes, setAvgHandlingTimeMinutes] = useState<number>(12);
  const [internalDevHourlyRate, setInternalDevHourlyRate] = useState<number>(85);
  const [productiveHoursPerMonth, setProductiveHoursPerMonth] = useState<number>(
    PRODUCTIVE_HOURS_DEFAULT
  );

  // Sensitivity Engine
  const [accuracyVariancePct, setAccuracyVariancePct] = useState<number>(0);
  const [churnSensitivity, setChurnSensitivity] = useState<number>(1.0);
  const [projectionMode, setProjectionMode] = useState<'conservative' | 'base' | 'optimistic'>(
    'base'
  );

  // UI Layout Controls
  const [showAdvancedParams, setShowAdvancedParams] = useState<boolean>(false);

  const selectedModel = useMemo(
    () => LLM_MODELS.find((m) => m.name === selectedModelName) ?? LLM_MODELS[1],
    [selectedModelName]
  );

  const dashboardInputs: DashboardInputs = useMemo(
    () => ({
      ticketVolume,
      costPerLiveTicket,
      deflectionGoal,
      selectedModelName,
      avgPromptTokens,
      avgCompletionTokens,
      avgTurnsPerResolved,
      avgTurnsBeforeEscalation,
      monthlyPlatformFee,
      implementationCost,
      customerLifetimeValue,
      baselineChurnRate: baselineChurnRate / 100,
      resolutionSatisfactionScore: resolutionSatisfactionScore / 100,
      avgHandlingTimeMinutes,
      internalDevHourlyRate,
      productiveHoursPerMonth,
      piiRedactionCost,
      observabilityCost,
      haFallbackCost,
      accuracyVariancePct,
      churnSensitivity,
      projectionMode,
    }),
    [
      ticketVolume, costPerLiveTicket, deflectionGoal, selectedModelName,
      avgPromptTokens, avgCompletionTokens, avgTurnsPerResolved, avgTurnsBeforeEscalation,
      monthlyPlatformFee, implementationCost, customerLifetimeValue, baselineChurnRate,
      resolutionSatisfactionScore, avgHandlingTimeMinutes, internalDevHourlyRate,
      productiveHoursPerMonth, piiRedactionCost, observabilityCost, haFallbackCost,
      accuracyVariancePct, churnSensitivity, projectionMode,
    ]
  );

  const metrics = useMemo(
    () => computeFinancials(dashboardInputs, selectedModel),
    [dashboardInputs, selectedModel]
  );

  const projectionTimelineData = useMemo(() => {
    let cumulativePureHuman = 0;
    let cumulativeHybrid = implementationCost;
    return Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1;
      cumulativePureHuman += metrics.pureHumanCost;
      cumulativeHybrid += metrics.totalHybridCost;
      return {
        month: `M${monthNum}`,
        'Legacy Support ($)': Math.round(cumulativePureHuman),
        'AI Hybrid Ops ($)': Math.round(cumulativeHybrid),
      };
    });
  }, [metrics, implementationCost]);

  const scatterData = useMemo(
    () =>
      LLM_MODELS.map((m) => {
        const inputCost = m.inputCostPer1M / 1_000_000;
        const outputCost = m.outputCostPer1M / 1_000_000;
        const turnCost = avgPromptTokens * inputCost + avgCompletionTokens * outputCost;
        return {
          name: m.name,
          latency: m.averageLatencySeconds,
          costPerSession: Number((turnCost * avgTurnsPerResolved * 100).toFixed(2)),
          tier: m.tier,
          isSelected: m.name === selectedModelName,
        };
      }),
    [avgPromptTokens, avgCompletionTokens, avgTurnsPerResolved, selectedModelName]
  );

  const infraBreakdownData = useMemo(
    () => [
      { name: 'Platform SaaS', value: metrics.monthlyInfraBreakdown.platform, fill: '#818cf8' },
      { name: 'PII Redaction', value: metrics.monthlyInfraBreakdown.piiRedaction, fill: '#f472b6' },
      { name: 'Observability', value: metrics.monthlyInfraBreakdown.observability, fill: '#34d399' },
      { name: 'HA Fallback', value: metrics.monthlyInfraBreakdown.haFallback, fill: '#fbbf24' },
    ],
    [metrics.monthlyInfraBreakdown]
  );

  const fmt = {
    usd: (v: number) => `$${Math.round(v).toLocaleString()}`,
    usdCents: (v: number) => `$${v.toFixed(2)}`,
    pct: (v: number) => `${v.toFixed(1)}%`,
    num: (v: number) => v.toLocaleString(),
    ftes: (v: number) => v.toFixed(2),
    months: (v: number) => (v === Infinity ? 'N/A' : `${v} mo`),
  };

  const modeConfig = {
    conservative: {
      label: 'Conservative',
      desc: 'Worst-Case (-25% Deflection)',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/30',
    },
    base: {
      label: 'Base Case',
      desc: 'Expected Baseline',
      color: 'text-slate-300',
      bg: 'bg-slate-700/30 border-slate-600/30',
    },
    optimistic: {
      label: 'Optimistic',
      desc: 'Best-Case (+20% Deflection)',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
    },
  };

  const currentMode = modeConfig[projectionMode];

  return (
    <div className="w-full bg-slate-950 text-slate-100 p-6 rounded-2xl border border-slate-800 shadow-2xl max-w-screen-2xl mx-auto font-sans">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/20 tracking-widest uppercase">
              Total Economic Impact Platform
            </span>
            <span
              className={`px-3 py-1 text-[10px] font-bold rounded-full border tracking-widest uppercase ${currentMode.bg} ${currentMode.color}`}
            >
              {currentMode.label} Mode
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            AI Deflection TCO Intelligence Studio
          </h1>
          <p className="text-slate-400 text-xs mt-1 max-w-xl">
            Production-grade TEI modeling for AI support deflection — covering direct savings,
            churn economics, engineering reinvestment, and risk-adjusted ROI.
          </p>
        </div>
        <div className="flex items-start gap-2 bg-amber-500/5 rounded-lg p-3 border border-amber-500/20 text-xs max-w-xs text-slate-300">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>
            Scenario mode:{' '}
            <strong className={currentMode.color}>{currentMode.desc}</strong>. Adjusted
            deflections:{' '}
            <strong className="font-mono text-white">{fmt.num(metrics.adjustedDeflections)}</strong>{' '}
            vs. target{' '}
            <strong className="font-mono text-slate-400">{fmt.num(metrics.targetDeflections)}</strong>.
          </p>
        </div>
      </div>

      {/* EXECUTIVE BRIEF BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/20 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              Net Annual TEI Gain
            </span>
          </div>
          <p className="text-3xl font-black font-mono text-white">
            {fmt.usd(metrics.totalAnnualEconomicValue)}
          </p>
          <p className="text-[10px] text-emerald-400/70 mt-1">
            Savings + Churn Preserved + Eng. Value
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
        </div>

        <div className="bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/20 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
              FTEs Reclaimed
            </span>
          </div>
          <p className="text-3xl font-black font-mono text-white">
            {fmt.ftes(metrics.ftesReclaimed)}
          </p>
          <p className="text-[10px] text-indigo-400/70 mt-1">
            {fmt.num(Math.round(metrics.monthlyManualHoursSaved))} hrs/mo reinvestable capacity
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-400" />
        </div>

        <div className="bg-gradient-to-br from-amber-950/60 to-slate-900 border border-amber-500/20 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <Percent className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
              Risk-Adjusted ROI
            </span>
          </div>
          <p className={`text-3xl font-black font-mono ${metrics.riskAdjustedRoi >= 0 ? 'text-white' : 'text-rose-400'}`}>
            {fmt.pct(metrics.riskAdjustedRoi)}
          </p>
          <p className="text-[10px] text-amber-400/70 mt-1">
            Scenario-discounted on {currentMode.label} assumptions
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-400" />
        </div>
      </div>

      {/* MAIN LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT PANEL: INPUTS */}
        <div className="lg:col-span-4 space-y-5">

          {/* Core Parameters */}
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800/70 space-y-4">
            <SectionHeader
              icon={<Cpu className="w-4 h-4 text-emerald-400" />}
              title="Operational Parameters"
              subtitle="Core volume and cost drivers"
            />
            <SliderInput
              label="Monthly Ticket Volume"
              value={ticketVolume}
              min={1000}
              max={50000}
              step={500}
              onChange={setTicketVolume}
              format={(v) => v.toLocaleString()}
              tooltip="Total support tickets received per month. This is the addressable universe for AI deflection."
            />
            <SliderInput
              label="Fully-Loaded AHT Cost / Ticket"
              value={costPerLiveTicket}
              min={5}
              max={75}
              step={0.5}
              onChange={setCostPerLiveTicket}
              format={(v) => `$${v.toFixed(2)}`}
              tooltip="Fully-loaded cost includes agent salary, benefits, tooling, and overhead per resolved ticket. HDI industry benchmark: $15–$25."
            />
            <SliderInput
              label="Target Deflection Rate"
              value={deflectionGoal}
              min={10}
              max={85}
              step={1}
              onChange={setDeflectionGoal}
              format={(v) => `${v}%`}
              accentClass="accent-cyan-500"
              tooltip="Percentage of tickets you expect AI to resolve without human intervention. Industry benchmarks: Tier 1 automation = 40–60%."
            />
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Primary LLM Engine
              </label>
              <select
                value={selectedModelName}
                onChange={(e) => setSelectedModelName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {LLM_MODELS.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.provider} — {m.name} ({m.tier})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* TEI Inputs */}
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800/70 space-y-4">
            <SectionHeader
              icon={<TrendingUp className="w-4 h-4 text-cyan-400" />}
              title="Total Economic Impact Inputs"
              subtitle="Churn economics & engineering reinvestment"
            />
            <NumberInput
              label="Customer Lifetime Value (CLV)"
              value={customerLifetimeValue}
              onChange={setCustomerLifetimeValue}
              prefix="$"
              tooltip="Average revenue a customer generates over their full relationship with your business. Used to quantify churn prevention value."
              textColor="text-cyan-400"
            />
            <SliderInput
              label="Resolution Satisfaction Score"
              value={resolutionSatisfactionScore}
              min={40}
              max={99}
              step={1}
              onChange={setResolutionSatisfactionScore}
              format={(v) => `${v}%`}
              accentClass="accent-cyan-500"
              tooltip="% of AI-deflected tickets resulting in customer satisfaction. Lower scores increase the implied churn risk from poor AI resolution."
            />
            <SliderInput
              label="Avg. Handling Time (AHT) / Ticket"
              value={avgHandlingTimeMinutes}
              min={2}
              max={60}
              step={1}
              onChange={setAvgHandlingTimeMinutes}
              format={(v) => `${v} min`}
              accentClass="accent-purple-500"
              tooltip="Average agent minutes spent per ticket. Multiplied by deflection volume to calculate hours reclaimed from manual work."
            />
            <NumberInput
              label="Internal Dev / Senior Agent Rate ($/hr)"
              value={internalDevHourlyRate}
              onChange={setInternalDevHourlyRate}
              prefix="$"
              tooltip="Fully-loaded hourly rate for the engineering or senior operations talent whose time is recaptured via AI deflection."
              textColor="text-purple-400"
            />
          </div>

          {/* Production Infrastructure Sidebar */}
          <div className="bg-slate-900/60 rounded-xl border border-slate-800/70 overflow-hidden">
            <button
              onClick={() => setShowInfraPanel(!showInfraPanel)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-rose-400" />
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Production Infrastructure & Compliance
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Monthly total:{' '}
                    <span className="text-rose-400 font-mono">
                      {fmt.usd(metrics.totalMonthlyInfraCost - monthlyPlatformFee)}
                    </span>
                  </p>
                </div>
              </div>
              {showInfraPanel ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {showInfraPanel && (
              <div className="px-5 pb-5 space-y-4 border-t border-slate-800">
                <p className="text-[10px] text-slate-500 pt-3 leading-relaxed">
                  Production AI systems require compliance and resilience layers. These costs are
                  often omitted from demo-grade ROI calculators, creating CFO credibility risk.
                </p>
                <NumberInput
                  label="PII Redaction / Security Layer"
                  value={piiRedactionCost}
                  onChange={setPiiRedactionCost}
                  prefix="$"
                  tooltip="Executive Rationale: Any AI system processing customer support data must redact PII before sending to LLM APIs. Required for HIPAA, GDPR, and SOC2 compliance."
                  textColor="text-rose-400"
                />
                <NumberInput
                  label="Observability / LangSmith Logging"
                  value={observabilityCost}
                  onChange={setObservabilityCost}
                  prefix="$"
                  tooltip="Executive Rationale: AI auditability is non-negotiable for regulated industries. Observability tools log every prompt/response for compliance review and quality assurance."
                  textColor="text-emerald-400"
                />
                <NumberInput
                  label="High Availability Fallback"
                  value={haFallbackCost}
                  onChange={setHaFallbackCost}
                  prefix="$"
                  tooltip="Executive Rationale: Single-provider LLM dependency creates SLA risk. A secondary model fallback ensures uptime commitments during provider outages."
                  textColor="text-amber-400"
                />
                <div className="pt-2">
                  <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-2">
                    Monthly Overhead Allocation
                  </p>
                  <div className="space-y-1.5">
                    {infraBreakdownData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: item.fill }}
                        />
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[10px] text-slate-400">{item.name}</span>
                          <span
                            className="text-[10px] font-mono font-bold"
                            style={{ color: item.fill }}
                          >
                            {fmt.usd(item.value)}/mo
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-slate-800 pt-1.5 flex justify-between items-center">
                      <span className="text-[10px] text-slate-300 font-semibold">Total Overhead</span>
                      <span className="text-[10px] font-mono font-bold text-white">
                        {fmt.usd(metrics.totalMonthlyInfraCost)}/mo
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Advanced Token Parameters */}
          <div className="bg-slate-900/60 rounded-xl border border-slate-800/70 overflow-hidden">
            <button
              onClick={() => setShowAdvancedParams(!showAdvancedParams)}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-800/30 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                <p className="text-sm font-semibold text-slate-200">Advanced Token Parameters</p>
              </div>
              {showAdvancedParams ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>
            {showAdvancedParams && (
              <div className="px-5 pb-5 border-t border-slate-800 pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <NumberInput
                    label="Prompt Tokens / Turn"
                    value={avgPromptTokens}
                    onChange={setAvgPromptTokens}
                    tooltip="Includes system prompt, RAG context, and conversation history per turn."
                  />
                  <NumberInput
                    label="Completion Tokens"
                    value={avgCompletionTokens}
                    onChange={setAvgCompletionTokens}
                    tooltip="Average output tokens generated per response. Typically 150–400 for support use cases."
                  />
                  <NumberInput
                    label="Turns to Resolve"
                    value={avgTurnsPerResolved}
                    onChange={setAvgTurnsPerResolved}
                    tooltip="Average conversational turns before successful AI resolution."
                  />
                  <NumberInput
                    label="Turns to Escalate"
                    value={avgTurnsBeforeEscalation}
                    onChange={setAvgTurnsBeforeEscalation}
                    tooltip="Turns consumed before handoff to human. These tokens are sunk cost."
                  />
                  <NumberInput
                    label="Platform SaaS Fee /mo"
                    value={monthlyPlatformFee}
                    onChange={setMonthlyPlatformFee}
                    prefix="$"
                    textColor="text-emerald-400"
                  />
                  <NumberInput
                    label="CapEx Build Cost"
                    value={implementationCost}
                    onChange={setImplementationCost}
                    prefix="$"
                    textColor="text-indigo-400"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: OUTPUTS */}
        <div className="lg:col-span-8 space-y-6">

          {/* SENSITIVITY ENGINE */}
          <div className="bg-slate-900/60 p-5 rounded-xl border border-amber-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <div>
                  <h2 className="text-sm font-semibold text-slate-200">
                    Sensitivity Engine — Stress Test
                  </h2>
                  <p className="text-[10px] text-slate-500">
                    Adjust variance assumptions to model scenario ranges for board presentations
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
                {(['conservative', 'base', 'optimistic'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setProjectionMode(mode)}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                      projectionMode === mode
                        ? mode === 'conservative'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : mode === 'optimistic'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-600/50 text-slate-300 border border-slate-600'
                        : 'text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    {mode === 'conservative' ? '⚠ Worst' : mode === 'optimistic' ? '✓ Best' : '◎ Base'}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <SliderInput
                  label="AI Accuracy Variance"
                  value={accuracyVariancePct}
                  min={-15}
                  max={15}
                  step={1}
                  onChange={setAccuracyVariancePct}
                  format={(v) => `${v > 0 ? '+' : ''}${v}%`}
                  accentClass={accuracyVariancePct < 0 ? 'accent-rose-500' : 'accent-emerald-500'}
                  tooltip="Applies a delta to your target deflection rate. -10% models an AI accuracy shortfall; +10% models outperformance."
                />
                <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500">
                  <div className="flex-1 h-1 bg-gradient-to-r from-rose-500 via-slate-700 to-emerald-500 rounded" />
                  <span>
                    Effective rate:{' '}
                    <span className="text-white font-mono">
                      {fmt.pct(
                        (deflectionGoal / 100) *
                          SCENARIO_MULTIPLIERS[projectionMode] *
                          (1 + accuracyVariancePct / 100) *
                          100
                      )}
                    </span>
                  </span>
                </div>
              </div>
              <div>
                <SliderInput
                  label="Churn Sensitivity Multiplier"
                  value={churnSensitivity}
                  min={0.25}
                  max={2.5}
                  step={0.05}
                  onChange={setChurnSensitivity}
                  format={(v) => `${v.toFixed(2)}x`}
                  accentClass={churnSensitivity > 1 ? 'accent-cyan-500' : 'accent-rose-500'}
                  tooltip="Scales the CLV-to-churn conversion. 1.0x = base. 0.5x = conservative. 2.0x = high-stakes retention environment."
                />
                <div className="mt-2 text-[10px] text-slate-500">
                  Churn revenue protected:{' '}
                  <span className="text-cyan-400 font-mono font-bold">
                    {fmt.usd(metrics.churnSavedRevenue)}/mo
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* METRIC CARDS ROW 1 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricCard
              label="Net Annual Savings"
              value={fmt.usd(metrics.annualSavings)}
              subtext={`${fmt.usd(metrics.monthlySavings)}/mo operational delta`}
              icon={<DollarSign className="w-4 h-4 text-emerald-400" />}
              accentColor="from-emerald-500 to-teal-400"
              badgeType="Financial Projection"
              tooltip="Annual delta between full human-operated support costs and the AI hybrid model. Formula: (Pure Human Cost - Total Hybrid Cost) × 12"
            />
            <MetricCard
              label="Churn Revenue Saved"
              value={fmt.usd(metrics.annualChurnSavedRevenue)}
              subtext={`${fmt.usd(metrics.churnSavedRevenue)}/mo preserved CLV`}
              icon={<TrendingUp className="w-4 h-4 text-cyan-400" />}
              accentColor="from-cyan-500 to-blue-500"
              badgeType="Financial Projection"
              tooltip="Revenue preserved by preventing churn. Formula: Deflections × (1 - SatisfactionScore) × CLV × ChurnSensitivity."
            />
            <MetricCard
              label="Engineering Value Reclaimed"
              value={fmt.usd(metrics.engineeringOpportunityCost)}
              subtext={`${fmt.ftes(metrics.ftesReclaimed)} FTE equivalents freed`}
              icon={<Users className="w-4 h-4 text-purple-400" />}
              accentColor="from-purple-500 to-indigo-500"
              badgeType="Operational Metric"
              tooltip="Dollar value of capacity recaptured from manual ticket handling. FTEs = Hours Saved ÷ 160 hrs/mo."
            />
            <MetricCard
              label="Sunk Escalation Tax"
              value={fmt.usd(metrics.nonDeflectedSunkTokensCost)}
              subtext={`${fmt.pct(
                (metrics.nonDeflectedSunkTokensCost / (metrics.monthlyTotalTokenSpent || 1)) * 100
              )} of token budget wasted`}
              icon={<AlertTriangle className="w-4 h-4 text-rose-400" />}
              accentColor="from-rose-500 to-pink-500"
              badgeType="Operational Metric"
              tooltip="Token spend on conversations that ended in human escalation with zero deflection value."
            />
          </div>

          {/* METRIC CARDS ROW 2 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricCard
              label="True Loaded Cost / Deflection"
              value={fmt.usdCents(metrics.trueLoadedCostPerDeflection)}
              subtext={`vs. ${fmt.usdCents(costPerLiveTicket)} fully-loaded human`}
              icon={<BarChart2 className="w-4 h-4 text-sky-400" />}
              accentColor="from-sky-500 to-blue-500"
              badgeType="Financial Projection"
              tooltip="All-in AI cost per deflected ticket: tokens + platform + PII + observability + HA, divided by actual deflections."
            />
            <MetricCard
              label="CapEx Break-Even"
              value={fmt.months(metrics.breakEvenMonths)}
              subtext="To recover implementation CapEx"
              icon={<Zap className="w-4 h-4 text-yellow-400" />}
              accentColor="from-yellow-500 to-amber-500"
              badgeType="Financial Projection"
              tooltip="Months to recover the one-time build cost from operational savings. Formula: CapEx ÷ Monthly Savings."
            />
            <MetricCard
              label="Monthly Token Spend"
              value={fmt.usd(metrics.monthlyTotalTokenSpent)}
              subtext={`${fmt.usd(metrics.totalMonthlyAICost)} all-in with infra`}
              icon={<Cpu className="w-4 h-4 text-indigo-400" />}
              accentColor="from-indigo-500 to-violet-500"
              badgeType="Operational Metric"
              tooltip="Raw API token costs for resolved and escalated sessions combined. All-in figure includes infra overhead."
            />
            <MetricCard
              label="Raw Operational ROI"
              value={fmt.pct(metrics.rawRoiPct)}
              subtext="Month-over-month hybrid vs. human"
              icon={<Percent className="w-4 h-4 text-teal-400" />}
              accentColor="from-teal-500 to-cyan-500"
              badgeType="Financial Projection"
              tooltip="Operational savings as a percentage of total hybrid AI operating costs."
            />
          </div>

          {/* 12-MONTH TCO CHART */}
          <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">
                  12-Month Cumulative TCO vs. Legacy Baseline
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Includes CapEx at M1 · {currentMode.label} scenario applied
                </p>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">
                Δ Year-1:{' '}
                {fmt.usd(
                  metrics.pureHumanCost * 12 -
                    (metrics.totalHybridCost * 12 + implementationCost)
                )}
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={projectionTimelineData}
                  margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gradHuman" x1="0" y1="0" x2="0" y2="1">
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
                  <YAxis
                    stroke="#475569"
                    fontSize={10}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                    formatter={chartCurrencyFormatter}
                  />
                  <Legend
                    verticalAlign="top"
                    height={32}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Legacy Support ($)"
                    stroke="#f43f5e"
                    fill="url(#gradHuman)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="AI Hybrid Ops ($)"
                    stroke="#10b981"
                    fill="url(#gradAI)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SPLIT CHARTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Token Spend Allocation */}
            <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 flex flex-col">
              <h3 className="text-sm font-semibold text-slate-200 mb-1">Token Budget Allocation</h3>
              <p className="text-[10px] text-slate-500 mb-4">
                Resolved value vs. sunk escalation waste vs. infrastructure overhead
              </p>
              <div className="flex-1 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: 'Monthly AI Spend',
                        'Resolved Token Spend': Math.round(metrics.successfulTokensCost),
                        'Escalation Sunk Cost': Math.round(metrics.nonDeflectedSunkTokensCost),
                        'Infra & Compliance': Math.round(metrics.totalMonthlyInfraCost),
                      },
                    ]}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis
                      type="number"
                      stroke="#475569"
                      fontSize={10}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#475569"
                      fontSize={10}
                      hide
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                      formatter={chartCurrencyFormatter}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                    <Bar dataKey="Resolved Token Spend" stackId="a" fill="#38bdf8" barSize={36} />
                    <Bar dataKey="Escalation Sunk Cost" stackId="a" fill="#fb7185" barSize={36} />
                    <Bar dataKey="Infra & Compliance" stackId="a" fill="#818cf8" barSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 p-3 bg-slate-950 rounded-lg border border-slate-800 text-[10px] text-slate-400 leading-relaxed">
                ⚠️{' '}
                <strong className="text-rose-400">Waste Ratio:</strong>{' '}
                <span className="font-mono text-rose-300 font-bold">
                  {fmt.pct(
                    (metrics.nonDeflectedSunkTokensCost /
                      (metrics.monthlyTotalTokenSpent || 1)) *
                      100
                  )}
                </span>{' '}
                of token spend yields no deflection value. Improve intent classification and
                escalation routing to recapture this.
              </div>
            </div>

            {/* Model Latency vs. Cost Matrix */}
            <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 flex flex-col">
              <h3 className="text-sm font-semibold text-slate-200 mb-1">
                Model Selection Matrix
              </h3>
              <p className="text-[10px] text-slate-500 mb-4">
                Latency (s) vs. cost per session (¢) — lower-left is optimal
              </p>
              <div className="flex-1 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      type="number"
                      dataKey="latency"
                      name="Latency"
                      unit="s"
                      stroke="#475569"
                      fontSize={10}
                      label={{
                        value: 'Response Latency (s)',
                        position: 'insideBottom',
                        offset: -12,
                        fill: '#64748b',
                        fontSize: 9,
                      }}
                    />
                    <YAxis
                      type="number"
                      dataKey="costPerSession"
                      name="Cost/Session"
                      unit="¢"
                      stroke="#475569"
                      fontSize={10}
                      label={{
                        value: 'Cost/Session (¢)',
                        angle: -90,
                        position: 'insideLeft',
                        offset: 10,
                        fill: '#64748b',
                        fontSize: 9,
                      }}
                    />
                    <ZAxis type="category" dataKey="name" name="Model" />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                    />
                    <Scatter name="Models" data={scatterData} fill="#818cf8">
                      <LabelList
                        dataKey="name"
                        position="top"
                        style={{ fill: '#94a3b8', fontSize: 8 }}
                      />
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 p-3 bg-slate-950 rounded-lg border border-slate-800 text-[10px] text-slate-400 leading-relaxed text-center">
                💡{' '}
                <span className="text-cyan-400 font-semibold">Routing Strategy:</span> Tier 1
                intents →{' '}
                <strong className="text-indigo-400">Gemini Flash / GPT-4o Mini</strong>. Complex
                reasoning → <strong className="text-indigo-400">Claude Sonnet</strong> or GPT-4o.
              </div>
            </div>
          </div>

          {/* TEI DECOMPOSITION CHART */}
          <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">
                  Total Economic Impact (TEI) Decomposition
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Full economic value stack — operational + strategic
                </p>
              </div>
              <Eye className="w-4 h-4 text-slate-500" />
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      category: 'Monthly Value',
                      'Direct Savings': Math.round(metrics.monthlySavings),
                      'Churn Revenue Saved': Math.round(metrics.churnSavedRevenue),
                      'Eng. Opportunity Value': Math.round(metrics.engineeringOpportunityCost),
                    },
                    {
                      category: 'Annual Value',
                      'Direct Savings': Math.round(metrics.annualSavings),
                      'Churn Revenue Saved': Math.round(metrics.annualChurnSavedRevenue),
                      'Eng. Opportunity Value': Math.round(
                        metrics.engineeringOpportunityCost * 12
                      ),
                    },
                  ]}
                  margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="category" stroke="#475569" fontSize={11} />
                  <YAxis
                    stroke="#475569"
                    fontSize={10}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                    formatter={chartCurrencyFormatter}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="Direct Savings" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Churn Revenue Saved" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Eng. Opportunity Value" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                {
                  label: 'Direct Savings',
                  annual: metrics.annualSavings,
                  color: 'text-emerald-400',
                  pct: (metrics.monthlySavings / (metrics.totalMonthlyEconomicValue || 1)) * 100,
                },
                {
                  label: 'Churn Revenue',
                  annual: metrics.annualChurnSavedRevenue,
                  color: 'text-cyan-400',
                  pct:
                    (metrics.churnSavedRevenue / (metrics.totalMonthlyEconomicValue || 1)) * 100,
                },
                {
                  label: 'Eng. Value',
                  annual: metrics.engineeringOpportunityCost * 12,
                  color: 'text-violet-400',
                  pct:
                    (metrics.engineeringOpportunityCost /
                      (metrics.totalMonthlyEconomicValue || 1)) *
                    100,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-slate-950 rounded-lg p-3 border border-slate-800 text-center"
                >
                  <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">
                    {item.label}
                  </p>
                  <p className={`text-sm font-bold font-mono ${item.color}`}>
                    {fmt.usd(item.annual)}/yr
                  </p>
                  <p className="text-[9px] text-slate-600 mt-0.5">{fmt.pct(item.pct)} of TEI</p>
                </div>
              ))}
            </div>
          </div>

          {/* ASSUMPTIONS FOOTER */}
          <div className="bg-slate-900/20 border border-slate-800 p-5 rounded-xl">
            <h4 className="font-bold text-slate-200 flex items-center gap-2 mb-4 text-sm">
              <FileText className="w-4 h-4 text-emerald-400" />
              Model Assumptions & Defensible Math Documentation
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] text-slate-400 leading-relaxed">
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-slate-300 mb-0.5">1. Sunk Token Realism</p>
                  <p>
                    Failed escalations consume tokens at avgTurnsBeforeEscalation depth with no
                    deflection value. Omitting this overstates ROI by 15–40% in typical
                    deployments.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-300 mb-0.5">2. Churn-CLV Bridge</p>
                  <p>
                    Churn preservation assumes poor AI resolution (1 - CSAT score) is a proxy for
                    churn signal at CLV value. Churn sensitivity multiplier bounds optimistic vs.
                    conservative retention assumptions.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-300 mb-0.5">3. FTE Reclaimed Formula</p>
                  <p>
                    FTEs Reclaimed = (Deflections × AHT in hours) ÷ 160 productive hours/month.
                    This is a capacity metric, not a headcount reduction recommendation.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-slate-300 mb-0.5">4. Production Infra TCO</p>
                  <p>
                    PII redaction, observability, and HA costs are surfaced explicitly because
                    they are systematically excluded from vendor ROI calculators. In HIPAA/GDPR
                    contexts these are mandatory, not optional.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-300 mb-0.5">
                    5. Scenario Discount Methodology
                  </p>
                  <p>
                    Conservative applies 0.75× multiplier to deflection rate. Optimistic applies
                    1.20×. Accuracy Variance adds an additive delta on top of scenario mode.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-300 mb-0.5">6. Risk-Adjusted ROI</p>
                  <p>
                    Formula: (TEI Annual × Scenario Multiplier − CapEx) ÷ CapEx × 100.
                    Incorporates scenario mode and accuracy variance as compounding discount
                    factors for board-level confidence intervals.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
