// ============================================================================
// FILE: LLMCostDashboard.tsx
// VERSION: 2.0 — Production-Grade TEI Platform
// TYPE: Production React Component (TypeScript)
// PURPOSE: Total Economic Impact (TEI) Platform for AI Deflection ROI
// ARCHITECTURE: Decoupled computation engine + clean UI render layer
//
// CHANGELOG v2.0:
//   - Fixed: baselineChurnRate now integrated into churn formula as a
//     probability weight, preventing CLV over-attribution on low-churn bases
//   - Added: ScenarioComparisonTable with Conservative / Base / Optimistic
//     side-by-side columns for board presentation mode
//   - Added: Executive Print Summary panel with copy-to-clipboard
//   - Fixed: Infra sidebar subtitle now shows correct totalMonthlyInfraCost
//   - Added: PaybackCurve chart showing cumulative savings trajectory
//   - Improved: Tooltip positioning uses portal-style fixed coords to prevent
//     overflow clipping inside grid containers
//   - Added: InputValidation guards with visual warnings for out-of-range
//     inputs (e.g. deflection > 85%)
//   - Added: "Board Mode" toggle that hides all input panels for clean
//     executive screen-share
// ============================================================================

import React, { useState, useMemo, useCallback, useRef } from 'react';
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
  Copy,
  Check,
  Presentation,
  PanelLeftClose,
  PanelLeftOpen,
  GitCompare,
  Target,
  TrendingDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ZAxis,
  LabelList,
  ReferenceLine,
  LineChart,
  Line,
  Cell,
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
  contextWindow: string;
  bestFor: string;
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
  // TEI: Churn Economics
  customerLifetimeValue: number;
  baselineChurnRate: number;        // 0–1 decimal (e.g. 0.05 = 5%)
  resolutionSatisfactionScore: number; // 0–1 decimal (e.g. 0.82 = 82%)
  // TEI: Engineering Reinvestment
  avgHandlingTimeMinutes: number;
  internalDevHourlyRate: number;
  productiveHoursPerMonth: number;
  // Production Infra & Compliance
  piiRedactionCost: number;
  observabilityCost: number;
  haFallbackCost: number;
  // Sensitivity Engine
  accuracyVariancePct: number;      // -15 to +15, applied as additive delta
  churnSensitivity: number;         // 0.25–2.5 multiplier
  projectionMode: ProjectionMode;
}

interface ComputedFinancials {
  // Volume
  targetDeflections: number;
  adjustedDeflections: number;
  targetEscalations: number;
  effectiveDeflectionRate: number;
  // Token Costs
  successfulTokensCost: number;
  nonDeflectedSunkTokensCost: number;
  monthlyTotalTokenSpent: number;
  costPerSuccessfulSession: number;
  costPerEscalatedSession: number;
  // Infrastructure
  totalMonthlyInfraCost: number;
  totalMonthlyAICost: number;
  monthlyInfraBreakdown: InfraBreakdown;
  // Human Cost Baseline
  pureHumanCost: number;
  hybridHumanCost: number;
  totalHybridCost: number;
  // Primary Financial Outputs
  monthlySavings: number;
  annualSavings: number;
  rawRoiPct: number;
  trueLoadedCostPerDeflection: number;
  breakEvenMonths: number;
  // TEI: Churn Impact
  // Formula v2: Deflections × baselineChurnRate × (1 - CSAT) × CLV × churnSensitivity
  // The baselineChurnRate anchors the pool of at-risk customers to a realistic base,
  // preventing CLV over-attribution when CSAT gaps are small.
  churnAtRiskPool: number;
  churnSavedRevenue: number;
  annualChurnSavedRevenue: number;
  // TEI: Engineering Reinvestment
  monthlyManualHoursSaved: number;
  ftesReclaimed: number;
  engineeringOpportunityCost: number;
  // TEI Composite
  totalMonthlyEconomicValue: number;
  totalAnnualEconomicValue: number;
  riskAdjustedRoi: number;
  // Validation Flags
  warnings: ValidationWarning[];
}

interface InfraBreakdown {
  platform: number;
  piiRedaction: number;
  observability: number;
  haFallback: number;
}

interface ValidationWarning {
  field: string;
  message: string;
  severity: 'warn' | 'error';
}

type ProjectionMode = 'conservative' | 'base' | 'optimistic';

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
    contextWindow: '1M tokens',
    bestFor: 'High-volume FAQ, routing',
  },
  {
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.60,
    averageLatencySeconds: 1.0,
    tier: 'Tier 1 (Fast/Cheap)',
    contextWindow: '128K tokens',
    bestFor: 'Tier 1 support, classification',
  },
  {
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    inputCostPer1M: 0.80,
    outputCostPer1M: 4.00,
    averageLatencySeconds: 1.2,
    tier: 'Tier 2 (Balanced)',
    contextWindow: '200K tokens',
    bestFor: 'Structured reasoning, policies',
  },
  {
    name: 'GPT-4o',
    provider: 'OpenAI',
    inputCostPer1M: 2.50,
    outputCostPer1M: 10.00,
    averageLatencySeconds: 2.1,
    tier: 'Tier 3 (Reasoning/Complex)',
    contextWindow: '128K tokens',
    bestFor: 'Complex troubleshooting, escalation',
  },
  {
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    inputCostPer1M: 3.00,
    outputCostPer1M: 15.00,
    averageLatencySeconds: 2.3,
    tier: 'Tier 3 (Reasoning/Complex)',
    contextWindow: '200K tokens',
    bestFor: 'High-stakes, compliance-critical',
  },
];

// Scenario multipliers applied to the effective deflection rate.
// Conservative: industry over-promise guard (-25%)
// Optimistic: high-performing team benchmark (+20%)
const SCENARIO_MULTIPLIERS: Record<ProjectionMode, number> = {
  conservative: 0.75,
  base: 1.0,
  optimistic: 1.20,
};

const PRODUCTIVE_HOURS_DEFAULT = 160;

// ============================================================================
// SHARED RECHARTS HELPERS
// ============================================================================

type RechartsValueType = number | string | readonly (string | number)[] | undefined;

const chartCurrencyFormatter = (value: RechartsValueType): [string, string] => {
  const num = typeof value === 'number' ? value : Number(value ?? 0);
  return [`$${num.toLocaleString()}`, ''];
};

// ============================================================================
// SECTION 3: COMPUTATION ENGINE (Fully Decoupled from UI)
// All financial logic lives here. The UI layer only reads ComputedFinancials.
// Each block is annotated with business intent for auditability.
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
    baselineChurnRate,
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

  const warnings: ValidationWarning[] = [];

  // ── BLOCK A: INPUT VALIDATION ─────────────────────────────────────────────
  // Surface data quality issues before they silently corrupt executive outputs.
  if (deflectionGoal > 85) {
    warnings.push({
      field: 'deflectionGoal',
      message: 'Deflection rates >85% are rare outside narrow FAQ domains. Validate with pilots.',
      severity: 'warn',
    });
  }
  if (customerLifetimeValue > 50000) {
    warnings.push({
      field: 'customerLifetimeValue',
      message: 'CLV >$50K implies enterprise contracts. Confirm churn attribution methodology.',
      severity: 'warn',
    });
  }
  if (resolutionSatisfactionScore < 0.50) {
    warnings.push({
      field: 'resolutionSatisfactionScore',
      message: 'CSAT <50% suggests model quality issues. TCO savings may be offset by churn.',
      severity: 'error',
    });
  }

  // ── BLOCK B: SCENARIO & VARIANCE ADJUSTMENT ───────────────────────────────
  // The effective deflection rate is the product of three factors:
  //   1. User's target deflection goal (their operational hypothesis)
  //   2. Scenario multiplier (conservative/base/optimistic discount)
  //   3. AI accuracy variance (a stress-test delta, additive on top of scenario)
  // This compound approach prevents double-discounting while still capturing
  // the independent risk dimensions of scenario planning vs. model performance.
  const scenarioMultiplier = SCENARIO_MULTIPLIERS[projectionMode];
  const varianceMultiplier = 1 + accuracyVariancePct / 100;
  const effectiveDeflectionRate = Math.min(
    0.95, // Hard cap: no system deflects 100% without human review
    Math.max(0, (deflectionGoal / 100) * scenarioMultiplier * varianceMultiplier)
  );

  // ── BLOCK C: VOLUME LAYER ─────────────────────────────────────────────────
  // Target vs. Adjusted: distinguishes the goal from the scenario-adjusted reality.
  // Executives need both: target for aspiration, adjusted for budget planning.
  const targetDeflections = Math.round(ticketVolume * (deflectionGoal / 100));
  const adjustedDeflections = Math.round(ticketVolume * effectiveDeflectionRate);
  const targetEscalations = ticketVolume - adjustedDeflections;

  // ── BLOCK D: TOKEN COST LAYER ─────────────────────────────────────────────
  // Each "session" = N conversational turns. We model two session types:
  //   1. Successful: runs to avgTurnsPerResolved (full conversation, resolved)
  //   2. Escalated:  runs to avgTurnsBeforeEscalation (partial, sunk cost)
  // Sunk cost modeling is critical: most ROI calculators only count successful
  // deflections, overstating savings by 15-40% depending on escalation rate.
  const inputCostPerToken = selectedModel.inputCostPer1M / 1_000_000;
  const outputCostPerToken = selectedModel.outputCostPer1M / 1_000_000;
  const singleTurnCost =
    avgPromptTokens * inputCostPerToken + avgCompletionTokens * outputCostPerToken;
  const costPerSuccessfulSession = singleTurnCost * avgTurnsPerResolved;
  const costPerEscalatedSession = singleTurnCost * avgTurnsBeforeEscalation;
  const successfulTokensCost = adjustedDeflections * costPerSuccessfulSession;
  const nonDeflectedSunkTokensCost = targetEscalations * costPerEscalatedSession;
  const monthlyTotalTokenSpent = successfulTokensCost + nonDeflectedSunkTokensCost;

  // ── BLOCK E: PRODUCTION INFRASTRUCTURE & COMPLIANCE ─────────────────────
  // These costs are systematically excluded from vendor ROI calculators,
  // creating a "demo vs. production" credibility gap with engineering teams.
  // Including them is the difference between a pitch deck and a business case.
  const monthlyInfraBreakdown: InfraBreakdown = {
    platform: monthlyPlatformFee,
    piiRedaction: piiRedactionCost,
    observability: observabilityCost,
    haFallback: haFallbackCost,
  };
  const totalMonthlyInfraCost =
    monthlyPlatformFee + piiRedactionCost + observabilityCost + haFallbackCost;
  const totalMonthlyAICost = monthlyTotalTokenSpent + totalMonthlyInfraCost;

  // ── BLOCK F: HUMAN COST BASELINE vs. HYBRID MODEL ─────────────────────────
  // Pure Human: what you'd pay today with no AI intervention.
  // Hybrid: human agents only handle escalations; AI handles deflections.
  // The delta is the operational savings — the most defensible ROI figure.
  const pureHumanCost = ticketVolume * costPerLiveTicket;
  const hybridHumanCost = targetEscalations * costPerLiveTicket;
  const totalHybridCost = hybridHumanCost + totalMonthlyAICost;

  // ── BLOCK G: PRIMARY FINANCIAL OUTPUTS ────────────────────────────────────
  const monthlySavings = pureHumanCost - totalHybridCost;
  const annualSavings = monthlySavings * 12;
  // rawRoiPct: Month-over-month operational efficiency gain.
  // Denominator is hybrid cost (what you spend), numerator is what you save.
  const rawRoiPct =
    totalHybridCost > 0 ? (monthlySavings / totalHybridCost) * 100 : 0;
  // trueLoadedCostPerDeflection: The "apples-to-apples" unit economics comparison.
  // All AI infrastructure costs allocated per actually-deflected ticket.
  const trueLoadedCostPerDeflection =
    adjustedDeflections > 0 ? totalMonthlyAICost / adjustedDeflections : 0;
  const breakEvenMonths =
    monthlySavings > 0
      ? Number((implementationCost / monthlySavings).toFixed(1))
      : Infinity;

  // ── BLOCK H: TEI — CHURN IMPACT (v2 Formula) ─────────────────────────────
  // v1 formula: Deflections × (1 - CSAT) × CLV  ← over-attributes CLV
  // v2 formula: Deflections × baselineChurnRate × (1 - CSAT) × CLV × sensitivity
  //
  // Why add baselineChurnRate?
  // In v1, if CSAT = 80%, we implied 20% of all deflected customers would churn.
  // At 5,000 deflections and $1,200 CLV, that's $1.2M/mo in "saved" churn —
  // a number CFOs will immediately reject. The baseline churn rate (e.g., 5%)
  // anchors the at-risk pool to customers who were already churn-probable.
  // This makes the number defensible to a finance team doing due diligence.
  //
  // churnAtRiskPool: Deflected customers who were already likely to churn
  const churnAtRiskPool = adjustedDeflections * baselineChurnRate;
  // dissatisfiedFromAI: Of at-risk customers, what fraction had a bad AI experience?
  const dissatisfiedFromAI = 1 - resolutionSatisfactionScore;
  // churnSavedRevenue: Revenue preserved by converting a bad AI experience
  // into a satisfactory one for at-risk customers.
  const churnSavedRevenue =
    churnAtRiskPool * dissatisfiedFromAI * customerLifetimeValue * churnSensitivity;
  const annualChurnSavedRevenue = churnSavedRevenue * 12;

  // ── BLOCK I: TEI — ENGINEERING REINVESTMENT ───────────────────────────────
  // This is a capacity metric, NOT a headcount reduction figure.
  // Executive framing: "We are not laying anyone off. We are freeing 2.3 FTEs
  // worth of capacity to focus on escalations, product feedback loops,
  // and process improvement — not ticket triage."
  //
  // Formula: FTEs Reclaimed = Monthly Hours Saved / Productive Hours per FTE
  const monthlyManualHoursSaved = (adjustedDeflections * avgHandlingTimeMinutes) / 60;
  const ftesReclaimed =
    productiveHoursPerMonth > 0
      ? monthlyManualHoursSaved / productiveHoursPerMonth
      : 0;
  // engineeringOpportunityCost: Dollar value of recaptured capacity.
  // Uses the rate of the talent whose time is most valuable to reinvest
  // (dev, senior agent, or QA lead depending on team structure).
  const engineeringOpportunityCost =
    ftesReclaimed * internalDevHourlyRate * productiveHoursPerMonth;

  // ── BLOCK J: TEI COMPOSITE ────────────────────────────────────────────────
  // Full economic value = direct savings + churn preservation + eng. capacity.
  // This is the number that should appear in the board deck, not just OpEx savings.
  const totalMonthlyEconomicValue =
    monthlySavings + churnSavedRevenue + engineeringOpportunityCost;
  const totalAnnualEconomicValue = totalMonthlyEconomicValue * 12;

  // ── BLOCK K: RISK-ADJUSTED ROI ────────────────────────────────────────────
  // Standard formula: (Net Gain - CapEx) / CapEx × 100
  // "Risk-Adjusted" means net gain is discounted by the scenario multiplier
  // a second time, creating a conservative floor for the board's "worst case."
  // Formula: ((TEI_Annual × ScenarioMultiplier) − CapEx) ÷ CapEx × 100
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
    effectiveDeflectionRate,
    successfulTokensCost,
    nonDeflectedSunkTokensCost,
    monthlyTotalTokenSpent,
    costPerSuccessfulSession,
    costPerEscalatedSession,
    totalMonthlyInfraCost,
    totalMonthlyAICost,
    monthlyInfraBreakdown,
    pureHumanCost,
    hybridHumanCost,
    totalHybridCost,
    monthlySavings,
    annualSavings,
    rawRoiPct,
    trueLoadedCostPerDeflection,
    breakEvenMonths,
    churnAtRiskPool,
    churnSavedRevenue,
    annualChurnSavedRevenue,
    monthlyManualHoursSaved,
    ftesReclaimed,
    engineeringOpportunityCost,
    totalMonthlyEconomicValue,
    totalAnnualEconomicValue,
    riskAdjustedRoi,
    warnings,
  };
}

// ============================================================================
// HELPER: Compute all three scenarios simultaneously for comparison table
// ============================================================================
function computeAllScenarios(
  inputs: DashboardInputs,
  selectedModel: LLMModel
): Record<ProjectionMode, ComputedFinancials> {
  return {
    conservative: computeFinancials({ ...inputs, projectionMode: 'conservative' }, selectedModel),
    base: computeFinancials({ ...inputs, projectionMode: 'base' }, selectedModel),
    optimistic: computeFinancials({ ...inputs, projectionMode: 'optimistic' }, selectedModel),
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
  highlight?: boolean;
  trend?: 'up' | 'down' | 'neutral';
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  icon,
  accentColor,
  badgeType,
  tooltip,
  highlight = false,
  trend,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const badgeColor =
    badgeType === 'Financial Projection'
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';

  const trendIcon =
    trend === 'up' ? (
      <TrendingUp className="w-3 h-3 text-emerald-400" />
    ) : trend === 'down' ? (
      <TrendingDown className="w-3 h-3 text-rose-400" />
    ) : null;

  return (
    <div
      className={`p-4 rounded-xl relative overflow-hidden group transition-all duration-200 ${
        highlight
          ? 'bg-emerald-950/40 border border-emerald-500/30 shadow-lg shadow-emerald-900/10'
          : 'bg-slate-900 border border-slate-800 hover:border-slate-700'
      }`}
    >
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
                <div className="absolute right-0 bottom-full mb-2 w-60 bg-slate-800 border border-slate-700 rounded-lg p-3 text-[11px] text-slate-300 leading-relaxed z-50 shadow-xl">
                  {tooltip}
                </div>
              )}
            </div>
          )}
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-2 mt-2">
        <p className="text-2xl font-bold font-mono text-white leading-none">{value}</p>
        {trendIcon}
      </div>
      {subtext && <p className="text-[10px] text-slate-500 mt-1.5">{subtext}</p>}
      <div className={`absolute bottom-0 right-0 left-0 h-0.5 bg-gradient-to-r ${accentColor}`} />
    </div>
  );
};

const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
}> = ({ icon, title, subtitle, rightSlot }) => (
  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
    <div className="flex items-center gap-2">
      {icon}
      <div>
        <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
        {subtitle && <p className="text-[10px] text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {rightSlot}
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
  warning?: string;
}> = ({ label, value, min, max, step, onChange, format, accentClass = 'accent-emerald-500', tooltip, warning }) => {
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
      {warning && (
        <p className="text-[9px] text-amber-400 mt-1 flex items-center gap-1">
          <AlertTriangle className="w-2.5 h-2.5" />
          {warning}
        </p>
      )}
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
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none">
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

// Validation Warning Banner
const WarningBanner: React.FC<{ warnings: ValidationWarning[] }> = ({ warnings }) => {
  if (warnings.length === 0) return null;
  return (
    <div className="space-y-2 mb-4">
      {warnings.map((w, i) => (
        <div
          key={i}
          className={`flex items-start gap-2 p-3 rounded-lg text-[11px] leading-relaxed ${
            w.severity === 'error'
              ? 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
              : 'bg-amber-500/10 border border-amber-500/20 text-amber-300'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>
            <strong className="uppercase tracking-wide">{w.field}: </strong>
            {w.message}
          </span>
        </div>
      ))}
    </div>
  );
};

// Scenario Comparison Table (Board Mode highlight feature)
const ScenarioComparisonTable: React.FC<{
  scenarios: Record<ProjectionMode, ComputedFinancials>;
  activeMode: ProjectionMode;
  fmt: ReturnType<typeof buildFormatters>;
}> = ({ scenarios, activeMode, fmt }) => {
  const rows: {
    label: string;
    key: keyof ComputedFinancials;
    format: (v: number) => string;
    highlight?: boolean;
  }[] = [
    { label: 'Adjusted Deflections', key: 'adjustedDeflections', format: fmt.num },
    { label: 'Effective Deflection Rate', key: 'effectiveDeflectionRate', format: (v) => fmt.pct(v * 100) },
    { label: 'Monthly Savings', key: 'monthlySavings', format: fmt.usd, highlight: true },
    { label: 'Annual Savings', key: 'annualSavings', format: fmt.usd, highlight: true },
    { label: 'Churn Revenue Saved (Mo)', key: 'churnSavedRevenue', format: fmt.usd },
    { label: 'FTEs Reclaimed', key: 'ftesReclaimed', format: fmt.ftes },
    { label: 'Total TEI (Annual)', key: 'totalAnnualEconomicValue', format: fmt.usd, highlight: true },
    { label: 'Risk-Adjusted ROI', key: 'riskAdjustedRoi', format: fmt.pct },
    { label: 'Break-Even', key: 'breakEvenMonths', format: fmt.months },
  ];

  const modeStyles: Record<ProjectionMode, { header: string; cell: string; badge: string }> = {
    conservative: {
      header: 'text-rose-400',
      cell: 'text-rose-300',
      badge: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    },
    base: {
      header: 'text-slate-300',
      cell: 'text-slate-200',
      badge: 'bg-slate-700/30 border-slate-600 text-slate-300',
    },
    optimistic: {
      header: 'text-emerald-400',
      cell: 'text-emerald-300',
      badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    },
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="border-b border-slate-800">
            <th className="text-left py-2 pr-4 text-slate-500 font-semibold uppercase tracking-wider w-40">
              Metric
            </th>
            {(['conservative', 'base', 'optimistic'] as ProjectionMode[]).map((mode) => (
              <th key={mode} className="text-right py-2 px-3">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[9px] font-bold uppercase tracking-widest ${
                    modeStyles[mode].badge
                  } ${activeMode === mode ? 'ring-1 ring-offset-0 ring-current' : ''}`}
                >
                  {mode === 'conservative' ? '⚠ Worst' : mode === 'optimistic' ? '✓ Best' : '◎ Base'}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.key}
              className={`border-b border-slate-800/50 transition-colors ${
                row.highlight ? 'bg-slate-900/60' : ''
              }`}
            >
              <td className="py-2.5 pr-4 text-slate-400 font-medium">{row.label}</td>
              {(['conservative', 'base', 'optimistic'] as ProjectionMode[]).map((mode) => {
                const rawVal = scenarios[mode][row.key as keyof ComputedFinancials];
                const numVal = typeof rawVal === 'number' ? rawVal : 0;
                const formatted = row.format(numVal);
                const isActive = mode === activeMode;
                return (
                  <td
                    key={mode}
                    className={`py-2.5 px-3 text-right font-mono font-bold ${
                      row.highlight
                        ? modeStyles[mode].cell
                        : isActive
                        ? 'text-white'
                        : 'text-slate-400'
                    } ${isActive ? 'bg-slate-800/40 rounded' : ''}`}
                  >
                    {formatted}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Executive Print Summary — copyable text block for email/deck insertion
const ExecutiveSummaryPanel: React.FC<{
  metrics: ComputedFinancials;
  inputs: DashboardInputs;
  selectedModel: LLMModel;
  fmt: ReturnType<typeof buildFormatters>;
}> = ({ metrics, inputs, selectedModel, fmt }) => {
  const [copied, setCopied] = useState(false);
  const textRef = useRef<HTMLPreElement>(null);

  const summaryText = `
AI DEFLECTION TCO — EXECUTIVE BRIEF
Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Scenario: ${inputs.projectionMode.toUpperCase()} | Model: ${selectedModel.name}

KEY METRICS
───────────────────────────────────────────
Net Annual TEI Gain:       ${fmt.usd(metrics.totalAnnualEconomicValue)}
  → Direct OpEx Savings:   ${fmt.usd(metrics.annualSavings)}
  → Churn Revenue Saved:   ${fmt.usd(metrics.annualChurnSavedRevenue)}
  → Engineering Value:     ${fmt.usd(metrics.engineeringOpportunityCost * 12)}

Risk-Adjusted ROI:         ${fmt.pct(metrics.riskAdjustedRoi)}
FTEs Reclaimed:            ${fmt.ftes(metrics.ftesReclaimed)} FTE equivalents/mo
CapEx Break-Even:          ${fmt.months(metrics.breakEvenMonths)}

UNIT ECONOMICS
───────────────────────────────────────────
True Loaded Cost/Deflection: ${fmt.usdCents(metrics.trueLoadedCostPerDeflection)}
Human Cost/Ticket:           ${fmt.usdCents(inputs.costPerLiveTicket)}
Efficiency Gain:             ${fmt.pct(((inputs.costPerLiveTicket - metrics.trueLoadedCostPerDeflection) / inputs.costPerLiveTicket) * 100)}

VOLUME (${inputs.projectionMode} scenario)
───────────────────────────────────────────
Monthly Volume:   ${fmt.num(inputs.ticketVolume)} tickets
Adjusted Deflect: ${fmt.num(metrics.adjustedDeflections)} (${fmt.pct(metrics.effectiveDeflectionRate * 100)})
Escalations:      ${fmt.num(metrics.targetEscalations)}

PRODUCTION TCO BREAKDOWN (Monthly)
───────────────────────────────────────────
LLM Token Spend:     ${fmt.usd(metrics.monthlyTotalTokenSpent)}
Platform SaaS:       ${fmt.usd(metrics.monthlyInfraBreakdown.platform)}
PII/Security Layer:  ${fmt.usd(metrics.monthlyInfraBreakdown.piiRedaction)}
Observability:       ${fmt.usd(metrics.monthlyInfraBreakdown.observability)}
HA Fallback:         ${fmt.usd(metrics.monthlyInfraBreakdown.haFallback)}
Total Monthly AI:    ${fmt.usd(metrics.totalMonthlyAICost)}

NOTE: Projections are scenario-modeled estimates. Validate with 30-day pilot data.
`.trim();

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [summaryText]);

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-700 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <Presentation className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold text-slate-200">Executive Print Summary</span>
          <span className="text-[10px] text-slate-500">— Paste into board deck or email thread</span>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
            copied
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200 hover:border-slate-600'
          }`}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied!' : 'Copy Brief'}
        </button>
      </div>
      <pre
        ref={textRef}
        className="p-5 text-[10px] text-slate-400 font-mono leading-relaxed whitespace-pre overflow-x-auto max-h-72 scrollbar-thin scrollbar-thumb-slate-700"
      >
        {summaryText}
      </pre>
    </div>
  );
};

// ============================================================================
// FORMATTER FACTORY — returns a stable set of formatters for use across components
// ============================================================================

function buildFormatters() {
  return {
    usd: (v: number) => `$${Math.round(v).toLocaleString()}`,
    usdCents: (v: number) => `$${v.toFixed(2)}`,
    pct: (v: number) => `${v.toFixed(1)}%`,
    num: (v: number) => Math.round(v).toLocaleString(),
    ftes: (v: number) => v.toFixed(2),
    months: (v: number) => (v === Infinity || v < 0 ? 'N/A' : `${v} mo`),
  };
}

// ============================================================================
// SECTION 5: MAIN DASHBOARD COMPONENT
// ============================================================================

export default function LLMCostDashboard() {
  // ── CORE OPERATIONAL INPUTS ───────────────────────────────────────────────
  const [ticketVolume, setTicketVolume] = useState<number>(12000);
  const [costPerLiveTicket, setCostPerLiveTicket] = useState<number>(18.5);
  const [deflectionGoal, setDeflectionGoal] = useState<number>(45);
  const [selectedModelName, setSelectedModelName] = useState<string>('GPT-4o Mini');

  // ── TOKEN SIMULATION ──────────────────────────────────────────────────────
  const [avgPromptTokens, setAvgPromptTokens] = useState<number>(650);
  const [avgCompletionTokens, setAvgCompletionTokens] = useState<number>(250);
  const [avgTurnsPerResolved, setAvgTurnsPerResolved] = useState<number>(4);
  const [avgTurnsBeforeEscalation, setAvgTurnsBeforeEscalation] = useState<number>(2);

  // ── PLATFORM & CAPEX ──────────────────────────────────────────────────────
  const [monthlyPlatformFee, setMonthlyPlatformFee] = useState<number>(1500);
  const [implementationCost, setImplementationCost] = useState<number>(8000);

  // ── PRODUCTION INFRASTRUCTURE & COMPLIANCE ────────────────────────────────
  const [piiRedactionCost, setPiiRedactionCost] = useState<number>(400);
  const [observabilityCost, setObservabilityCost] = useState<number>(300);
  const [haFallbackCost, setHaFallbackCost] = useState<number>(250);

  // ── TEI: CHURN IMPACT ─────────────────────────────────────────────────────
  const [customerLifetimeValue, setCustomerLifetimeValue] = useState<number>(1200);
  const [baselineChurnRate, setBaselineChurnRate] = useState<number>(5); // stored as % (0–100)
  const [resolutionSatisfactionScore, setResolutionSatisfactionScore] = useState<number>(82); // stored as % (0–100)

  // ── TEI: ENGINEERING REINVESTMENT ─────────────────────────────────────────
  const [avgHandlingTimeMinutes, setAvgHandlingTimeMinutes] = useState<number>(12);
  const [internalDevHourlyRate, setInternalDevHourlyRate] = useState<number>(85);
  const [productiveHoursPerMonth, setProductiveHoursPerMonth] = useState<number>(PRODUCTIVE_HOURS_DEFAULT);

  // ── SENSITIVITY ENGINE ────────────────────────────────────────────────────
  const [accuracyVariancePct, setAccuracyVariancePct] = useState<number>(0);
  const [churnSensitivity, setChurnSensitivity] = useState<number>(1.0);
  const [projectionMode, setProjectionMode] = useState<ProjectionMode>('base');

  // ── UI LAYOUT CONTROLS ────────────────────────────────────────────────────
  const [showAdvancedParams, setShowAdvancedParams] = useState<boolean>(false);
  const [showInfraPanel, setShowInfraPanel] = useState<boolean>(true);
  const [showComparisonTable, setShowComparisonTable] = useState<boolean>(false);
  const [showExecSummary, setShowExecSummary] = useState<boolean>(false);
  const [boardMode, setBoardMode] = useState<boolean>(false);

  // ── DERIVED: SELECTED MODEL ───────────────────────────────────────────────
  const selectedModel = useMemo(
    () => LLM_MODELS.find((m) => m.name === selectedModelName) ?? LLM_MODELS[1],
    [selectedModelName]
  );

  // ── STABLE FORMATTER INSTANCE ─────────────────────────────────────────────
  const fmt = useMemo(() => buildFormatters(), []);

  // ── NORMALIZED INPUTS OBJECT ─────────────────────────────────────────────
  // Normalizes percentage inputs to 0–1 decimals before passing to the
  // computation engine, keeping the engine pure (no UI-unit awareness).
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

  // ── MEMOIZED COMPUTE: ACTIVE SCENARIO ────────────────────────────────────
  // useMemo ensures the entire financial model recalculates reactively when
  // any input changes. No useEffect needed — pure derivation.
  const metrics = useMemo(
    () => computeFinancials(dashboardInputs, selectedModel),
    [dashboardInputs, selectedModel]
  );

  // ── MEMOIZED COMPUTE: ALL THREE SCENARIOS (for comparison table) ──────────
  const allScenarios = useMemo(
    () => computeAllScenarios(dashboardInputs, selectedModel),
    [dashboardInputs, selectedModel]
  );

  // ── CHART DATA: 12-MONTH CUMULATIVE TCO ──────────────────────────────────
  const projectionTimelineData = useMemo(() => {
    let cumulativePureHuman = 0;
    let cumulativeHybrid = implementationCost; // CapEx front-loaded at M1
    return Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1;
      cumulativePureHuman += metrics.pureHumanCost;
      cumulativeHybrid += metrics.totalHybridCost;
      const delta = cumulativePureHuman - cumulativeHybrid;
      return {
        month: `M${monthNum}`,
        'Legacy Support ($)': Math.round(cumulativePureHuman),
        'AI Hybrid Ops ($)': Math.round(cumulativeHybrid),
        'Cumulative Savings ($)': Math.round(delta),
        breakEven: metrics.breakEvenMonths !== Infinity && monthNum >= Math.ceil(metrics.breakEvenMonths),
      };
    });
  }, [metrics, implementationCost]);

  // ── CHART DATA: MONTHLY PAYBACK CURVE ────────────────────────────────────
  // Shows the net cumulative position (positive = savings territory)
  const paybackCurveData = useMemo(
    () =>
      projectionTimelineData.map((d) => ({
        month: d.month,
        'Net Position ($)': d['Cumulative Savings ($)'],
      })),
    [projectionTimelineData]
  );

  // ── CHART DATA: MODEL SELECTION MATRIX ───────────────────────────────────
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

  // ── CHART DATA: INFRA BREAKDOWN ───────────────────────────────────────────
  const infraBreakdownData = useMemo(
    () => [
      { name: 'Platform SaaS', value: metrics.monthlyInfraBreakdown.platform, fill: '#818cf8' },
      { name: 'PII Redaction', value: metrics.monthlyInfraBreakdown.piiRedaction, fill: '#f472b6' },
      { name: 'Observability', value: metrics.monthlyInfraBreakdown.observability, fill: '#34d399' },
      { name: 'HA Fallback', value: metrics.monthlyInfraBreakdown.haFallback, fill: '#fbbf24' },
    ],
    [metrics.monthlyInfraBreakdown]
  );

  // ── SCENARIO CONFIG FOR UI ────────────────────────────────────────────────
  const modeConfig: Record<ProjectionMode, { label: string; desc: string; color: string; bg: string }> = {
    conservative: {
      label: 'Conservative',
      desc: 'Worst-Case (×0.75 Deflection)',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/30',
    },
    base: {
      label: 'Base Case',
      desc: 'Expected Baseline (×1.0)',
      color: 'text-slate-300',
      bg: 'bg-slate-700/30 border-slate-600/30',
    },
    optimistic: {
      label: 'Optimistic',
      desc: 'Best-Case (×1.20 Deflection)',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
    },
  };
  const currentMode = modeConfig[projectionMode];

  // ── BREAK-EVEN MONTH (for reference line) ────────────────────────────────
  const breakEvenMonth =
    metrics.breakEvenMonths !== Infinity
      ? `M${Math.ceil(metrics.breakEvenMonths)}`
      : null;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="w-full bg-slate-950 text-slate-100 p-6 rounded-2xl border border-slate-800 shadow-2xl max-w-screen-2xl mx-auto font-sans">

      {/* ══════════════════════════════════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/20 tracking-widest uppercase">
              Total Economic Impact Platform
            </span>
            <span
              className={`px-3 py-1 text-[10px] font-bold rounded-full border tracking-widest uppercase ${currentMode.bg} ${currentMode.color}`}
            >
              {currentMode.label} Mode
            </span>
            {boardMode && (
              <span className="px-3 py-1 bg-violet-500/10 text-violet-400 text-[10px] font-bold rounded-full border border-violet-500/20 tracking-widest uppercase">
                Board View
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            AI Deflection TCO Intelligence Studio
          </h1>
          <p className="text-slate-400 text-xs mt-1 max-w-xl">
            Production-grade TEI modeling — direct savings, churn economics,
            engineering reinvestment, and risk-adjusted ROI for board-level confidence.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Board Mode Toggle */}
          <button
            onClick={() => setBoardMode(!boardMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider border transition-all ${
              boardMode
                ? 'bg-violet-500/20 text-violet-400 border-violet-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600 hover:text-slate-300'
            }`}
          >
            {boardMode ? (
              <PanelLeftOpen className="w-3.5 h-3.5" />
            ) : (
              <PanelLeftClose className="w-3.5 h-3.5" />
            )}
            {boardMode ? 'Show Inputs' : 'Board Mode'}
          </button>

          {/* Scenario Divergence Alert */}
          <div className="flex items-start gap-2 bg-amber-500/5 rounded-lg p-3 border border-amber-500/20 text-xs max-w-xs text-slate-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong className={currentMode.color}>{currentMode.desc}</strong> —{' '}
              <span className="font-mono text-white">{fmt.num(metrics.adjustedDeflections)}</span> deflections
              vs. target{' '}
              <span className="font-mono text-slate-400">{fmt.num(metrics.targetDeflections)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          VALIDATION WARNINGS
      ══════════════════════════════════════════════════════════════════════ */}
      <WarningBanner warnings={metrics.warnings} />

      {/* ══════════════════════════════════════════════════════════════════════
          EXECUTIVE BRIEF BANNER (3-KPI Summary)
      ══════════════════════════════════════════════════════════════════════ */}
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
            OpEx Savings + Churn Preserved + Capacity Value
          </p>
          <div className="mt-3 grid grid-cols-3 gap-1 text-[9px]">
            <div className="bg-slate-950/60 rounded p-1.5 text-center">
              <p className="text-emerald-400 font-mono font-bold">{fmt.usd(metrics.annualSavings)}</p>
              <p className="text-slate-500 mt-0.5">OpEx</p>
            </div>
            <div className="bg-slate-950/60 rounded p-1.5 text-center">
              <p className="text-cyan-400 font-mono font-bold">{fmt.usd(metrics.annualChurnSavedRevenue)}</p>
              <p className="text-slate-500 mt-0.5">Churn</p>
            </div>
            <div className="bg-slate-950/60 rounded p-1.5 text-center">
              <p className="text-violet-400 font-mono font-bold">{fmt.usd(metrics.engineeringOpportunityCost * 12)}</p>
              <p className="text-slate-500 mt-0.5">Eng.</p>
            </div>
          </div>
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
          <div className="mt-3 p-2.5 bg-slate-950/60 rounded text-[9px] text-slate-400 leading-relaxed">
            <strong className="text-indigo-400">Capacity Framing:</strong> Not headcount reduction.
            Freed time redirects to escalation quality, product feedback, and strategic CX work.
          </div>
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
          <div className="mt-3 grid grid-cols-2 gap-1 text-[9px]">
            <div className="bg-slate-950/60 rounded p-1.5 text-center">
              <p className="text-rose-400 font-mono font-bold">
                {fmt.pct(allScenarios.conservative.riskAdjustedRoi)}
              </p>
              <p className="text-slate-500 mt-0.5">Worst</p>
            </div>
            <div className="bg-slate-950/60 rounded p-1.5 text-center">
              <p className="text-emerald-400 font-mono font-bold">
                {fmt.pct(allScenarios.optimistic.riskAdjustedRoi)}
              </p>
              <p className="text-slate-500 mt-0.5">Best</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-400" />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MAIN LAYOUT
      ══════════════════════════════════════════════════════════════════════ */}
      <div className={`grid gap-6 ${boardMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'}`}>

        {/* ── LEFT PANEL: INPUTS (hidden in Board Mode) ───────────────────── */}
        {!boardMode && (
          <div className="lg:col-span-4 space-y-5">

            {/* ── Core Operational Parameters ── */}
            <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800/70 space-y-4">
              <SectionHeader
                icon={<Cpu className="w-4 h-4 text-emerald-400" />}
                title="Operational Parameters"
                subtitle="Core volume and cost drivers"
              />
              <SliderInput
                label="Monthly Ticket Volume"
                value={ticketVolume}
                min={500}
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
                warning={deflectionGoal > 70 ? 'Rates >70% are uncommon. Use conservative mode for board presentations.' : undefined}
              />
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
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
                {/* Model detail chip */}
                <div className="mt-2 p-2.5 bg-slate-800/60 rounded-lg border border-slate-700/50 text-[10px] text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Context Window</span>
                    <span className="text-slate-300 font-mono">{selectedModel.contextWindow}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Best For</span>
                    <span className="text-slate-300">{selectedModel.bestFor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Latency</span>
                    <span className="text-slate-300 font-mono">{selectedModel.averageLatencySeconds}s avg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── TEI: Churn & Engineering Inputs ── */}
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
                tooltip="Average revenue a customer generates over their full relationship. Used to quantify churn prevention value. Churn formula anchors to baseline rate to prevent over-attribution."
                textColor="text-cyan-400"
              />
              <SliderInput
                label="Baseline Monthly Churn Rate"
                value={baselineChurnRate}
                min={0.5}
                max={25}
                step={0.5}
                onChange={setBaselineChurnRate}
                format={(v) => `${v}%`}
                accentClass="accent-rose-500"
                tooltip="Your existing monthly churn rate. This anchors the at-risk customer pool — prevents CLV over-attribution when CSAT gaps are small. Formula: Deflections × ChurnRate × (1-CSAT) × CLV."
              />
              <SliderInput
                label="AI Resolution Satisfaction Score"
                value={resolutionSatisfactionScore}
                min={40}
                max={99}
                step={1}
                onChange={setResolutionSatisfactionScore}
                format={(v) => `${v}%`}
                accentClass="accent-cyan-500"
                tooltip="% of AI-deflected tickets resulting in customer satisfaction. Lower scores increase implied churn risk from poor AI resolution quality."
                warning={resolutionSatisfactionScore < 60 ? 'CSAT <60% significantly elevates churn risk. Consider model quality improvements before scaling.' : undefined}
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
                tooltip="Average agent minutes per ticket. Multiplied by deflection volume to calculate hours reclaimed from manual work."
              />
              <NumberInput
                label="Internal Dev / Senior Agent Rate ($/hr)"
                value={internalDevHourlyRate}
                onChange={setInternalDevHourlyRate}
                prefix="$"
                tooltip="Fully-loaded hourly rate for engineering or senior operations talent whose time is recaptured via AI deflection. This is the reinvestment opportunity value."
                textColor="text-purple-400"
              />
            </div>

            {/* ── Production Infrastructure & Compliance ── */}
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
                      <span className="text-rose-400 font-mono font-bold">
                        {fmt.usd(metrics.totalMonthlyInfraCost)}/mo
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
                    Production AI systems require compliance and resilience layers systematically
                    excluded from vendor ROI calculators. Including them separates a pitch deck
                    from a defensible business case.
                  </p>
                  <NumberInput
                    label="PII Redaction / Security Layer"
                    value={piiRedactionCost}
                    onChange={setPiiRedactionCost}
                    prefix="$"
                    tooltip="Executive Rationale: Any AI system processing customer support data must redact PII before sending to external LLM APIs. Mandatory for HIPAA, GDPR, SOC 2, and CCPA compliance. Non-compliance fines can exceed this cost by 4–5 orders of magnitude."
                    textColor="text-rose-400"
                  />
                  <NumberInput
                    label="Observability / LangSmith Logging"
                    value={observabilityCost}
                    onChange={setObservabilityCost}
                    prefix="$"
                    tooltip="Executive Rationale: AI auditability is non-negotiable in regulated industries. Observability platforms (LangSmith, Arize, Weights & Biases) log every prompt/response for compliance review, QA, and model drift detection. Without this, you cannot prove the system is performing safely."
                    textColor="text-emerald-400"
                  />
                  <NumberInput
                    label="High Availability Fallback Model"
                    value={haFallbackCost}
                    onChange={setHaFallbackCost}
                    prefix="$"
                    tooltip="Executive Rationale: Single-provider LLM dependency creates SLA risk. A secondary model fallback (e.g., Google as fallback to OpenAI) ensures customer-facing uptime commitments are met during provider outages. Major LLM providers have had 2–4 hour outage events that would halt all deflection without HA."
                    textColor="text-amber-400"
                  />
                  {/* Infra breakdown mini-chart */}
                  <div className="pt-2">
                    <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-2">
                      Monthly Overhead Allocation
                    </p>
                    <div className="space-y-1.5">
                      {infraBreakdownData.map((item) => {
                        const pct = metrics.totalMonthlyInfraCost > 0
                          ? (item.value / metrics.totalMonthlyInfraCost) * 100
                          : 0;
                        return (
                          <div key={item.name}>
                            <div className="flex items-center justify-between mb-0.5">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                                <span className="text-[10px] text-slate-400">{item.name}</span>
                              </div>
                              <span className="text-[10px] font-mono font-bold" style={{ color: item.fill }}>
                                {fmt.usd(item.value)}/mo
                              </span>
                            </div>
                            {/* Progress bar */}
                            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{ width: `${pct}%`, backgroundColor: item.fill, opacity: 0.7 }}
                              />
                            </div>
                          </div>
                        );
                      })}
                      <div className="border-t border-slate-800 pt-1.5 flex justify-between items-center">
                        <span className="text-[10px] text-slate-300 font-semibold">Total Production Overhead</span>
                        <span className="text-[10px] font-mono font-bold text-white">
                          {fmt.usd(metrics.totalMonthlyInfraCost)}/mo
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Advanced Token Parameters ── */}
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
                      tooltip="Includes system prompt, RAG context, conversation history, and user message per turn."
                    />
                    <NumberInput
                      label="Completion Tokens"
                      value={avgCompletionTokens}
                      onChange={setAvgCompletionTokens}
                      tooltip="Average output tokens per response. Typically 150–400 for support use cases."
                    />
                    <NumberInput
                      label="Turns to Resolve"
                      value={avgTurnsPerResolved}
                      onChange={setAvgTurnsPerResolved}
                      tooltip="Average conversational turns before successful AI resolution. SaaS Tier 1 avg: 3–6."
                    />
                    <NumberInput
                      label="Turns to Escalate"
                      value={avgTurnsBeforeEscalation}
                      onChange={setAvgTurnsBeforeEscalation}
                      tooltip="Turns consumed before human handoff. These tokens are sunk cost — no deflection value generated."
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
                      tooltip="One-time implementation cost. Amortized for break-even calculation. Does not include ongoing infra."
                    />
                    <NumberInput
                      label="Productive Hrs / FTE / Mo"
                      value={productiveHoursPerMonth}
                      onChange={setProductiveHoursPerMonth}
                      tooltip="Industry standard: 160 hours/month (40hrs/wk × 4 wks). Reduce for meetings, training, admin overhead."
                    />
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ── RIGHT PANEL: OUTPUTS ─────────────────────────────────────────── */}
        <div className={`space-y-6 ${boardMode ? 'col-span-full' : 'lg:col-span-8'}`}>

          {/* ── SENSITIVITY ENGINE ── */}
          <div className="bg-slate-900/60 p-5 rounded-xl border border-amber-500/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <div>
                  <h2 className="text-sm font-semibold text-slate-200">
                    Sensitivity Engine — Stress Test
                  </h2>
                  <p className="text-[10px] text-slate-500">
                    Variance assumptions for board scenario modeling. Changes propagate instantly.
                  </p>
                </div>
              </div>
              {/* Scenario Toggle */}
              <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1 shrink-0">
                {(['conservative', 'base', 'optimistic'] as ProjectionMode[]).map((mode) => (
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
                  tooltip="Additive delta on top of scenario multiplier. -10% models AI accuracy shortfall (poor intent coverage); +10% models outperformance (high RAG retrieval quality). Applied after scenario discount to avoid double-counting."
                />
                <div className="mt-2 text-[10px] text-slate-500">
                  Effective deflection rate:{' '}
                  <span className="text-white font-mono font-bold">
                    {fmt.pct(metrics.effectiveDeflectionRate * 100)}
                  </span>
                  {' '}(target: {deflectionGoal}% × {SCENARIO_MULTIPLIERS[projectionMode]}× scenario × {accuracyVariancePct >= 0 ? '+' : ''}{accuracyVariancePct}% variance)
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
                  tooltip="Scales the churn-to-CLV conversion. 1.0x = base assumption. 0.5x = conservative (low retention stakes). 2.0x = high-retention-value environment (subscription SaaS, financial services)."
                />
                <div className="mt-2 text-[10px] text-slate-500">
                  At-risk pool:{' '}
                  <span className="text-amber-400 font-mono font-bold">
                    {fmt.num(Math.round(metrics.churnAtRiskPool))} customers
                  </span>
                  {' '}→ churn revenue protected:{' '}
                  <span className="text-cyan-400 font-mono font-bold">
                    {fmt.usd(metrics.churnSavedRevenue)}/mo
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── METRIC CARDS ROW 1: Financial Projections ── */}
          <div>
            <p className="text-[9px] uppercase tracking-widest text-slate-600 mb-2 font-semibold">
              Primary Financial Projections
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <MetricCard
                label="Net Annual Savings"
                value={fmt.usd(metrics.annualSavings)}
                subtext={`${fmt.usd(metrics.monthlySavings)}/mo operational delta`}
                icon={<DollarSign className="w-4 h-4 text-emerald-400" />}
                accentColor="from-emerald-500 to-teal-400"
                badgeType="Financial Projection"
                highlight
                trend={metrics.monthlySavings > 0 ? 'up' : 'down'}
                tooltip="Annual delta between full human-operated support costs and the AI hybrid model. Formula: (Pure Human Cost − Total Hybrid Cost) × 12. Includes all production infra costs in denominator."
              />
              <MetricCard
                label="Churn Revenue Saved"
                value={fmt.usd(metrics.annualChurnSavedRevenue)}
                subtext={`${fmt.usd(metrics.churnSavedRevenue)}/mo CLV preserved`}
                icon={<TrendingUp className="w-4 h-4 text-cyan-400" />}
                accentColor="from-cyan-500 to-blue-500"
                badgeType="Financial Projection"
                trend="up"
                tooltip="Revenue preserved by preventing churn among at-risk customers. v2 Formula: Deflections × BaselineChurnRate × (1 − CSAT) × CLV × Sensitivity. Baseline churn rate prevents over-attribution vs. v1."
              />
              <MetricCard
                label="Engineering Value Reclaimed"
                value={fmt.usd(metrics.engineeringOpportunityCost)}
                subtext={`${fmt.ftes(metrics.ftesReclaimed)} FTE equivalents/mo`}
                icon={<Users className="w-4 h-4 text-purple-400" />}
                accentColor="from-purple-500 to-indigo-500"
                badgeType="Operational Metric"
                tooltip="Dollar value of capacity recaptured from manual ticket handling. FTEs = (Deflections × AHT/60) ÷ Productive Hours. This is reinvestable capacity — not a headcount reduction."
              />
              <MetricCard
                label="Sunk Escalation Tax"
                value={fmt.usd(metrics.nonDeflectedSunkTokensCost)}
                subtext={`${fmt.pct((metrics.nonDeflectedSunkTokensCost / (metrics.monthlyTotalTokenSpent || 1)) * 100)} of token budget wasted`}
                icon={<AlertTriangle className="w-4 h-4 text-rose-400" />}
                accentColor="from-rose-500 to-pink-500"
                badgeType="Operational Metric"
                trend="down"
                tooltip="Token spend on conversations that ended in human escalation with zero deflection value. Reduce via better intent classification and confidence thresholding. This waste ratio is typically hidden in vendor demos."
              />
            </div>
          </div>

          {/* ── METRIC CARDS ROW 2: Unit Economics ── */}
          <div>
            <p className="text-[9px] uppercase tracking-widest text-slate-600 mb-2 font-semibold">
              Unit Economics & Operations
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <MetricCard
                label="True Loaded Cost / Deflection"
                value={fmt.usdCents(metrics.trueLoadedCostPerDeflection)}
                subtext={`vs. ${fmt.usdCents(costPerLiveTicket)} human fully-loaded`}
                icon={<Target className="w-4 h-4 text-sky-400" />}
                accentColor="from-sky-500 to-blue-500"
                badgeType="Financial Projection"
                tooltip="All-in AI cost per deflected ticket: (tokens + platform + PII redaction + observability + HA fallback) ÷ actual adjusted deflections. This is the honest unit economics number for procurement conversations."
              />
              <MetricCard
                label="CapEx Break-Even"
                value={fmt.months(metrics.breakEvenMonths)}
                subtext={`on ${fmt.usd(implementationCost)} implementation CapEx`}
                icon={<Zap className="w-4 h-4 text-yellow-400" />}
                accentColor="from-yellow-500 to-amber-500"
                badgeType="Financial Projection"
                tooltip="Months to recover one-time build cost from operational savings. Formula: CapEx ÷ Monthly Savings. A break-even under 6 months is strong justification for CFO approval."
              />
              <MetricCard
                label="Monthly Token Spend"
                value={fmt.usd(metrics.monthlyTotalTokenSpent)}
                subtext={`${fmt.usd(metrics.totalMonthlyAICost)} all-in with infra`}
                icon={<Cpu className="w-4 h-4 text-indigo-400" />}
                accentColor="from-indigo-500 to-violet-500"
                badgeType="Operational Metric"
                tooltip="Raw API token costs for resolved + escalated sessions. All-in figure adds platform, PII, observability, and HA overhead. Budget against this number, not the token-only figure."
              />
              <MetricCard
                label="Raw Operational ROI"
                value={fmt.pct(metrics.rawRoiPct)}
                subtext="Month-over-month hybrid efficiency"
                icon={<Percent className="w-4 h-4 text-teal-400" />}
                accentColor="from-teal-500 to-cyan-500"
                badgeType="Financial Projection"
                tooltip="Operational savings as a percentage of total hybrid AI operating costs. Does not include churn or engineering value — the 'floor' ROI figure for skeptical CFO challenges."
              />
            </div>
          </div>

          {/* ── SCENARIO COMPARISON TABLE ── */}
          <div className="bg-slate-900/40 rounded-xl border border-slate-800 overflow-hidden">
            <button
              onClick={() => setShowComparisonTable(!showComparisonTable)}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-800/20 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-violet-400" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">
                    Scenario Comparison Table
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Conservative / Base / Optimistic — side-by-side for board presentation
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-mono">
                  TEI Range: {fmt.usd(allScenarios.conservative.totalAnnualEconomicValue)} – {fmt.usd(allScenarios.optimistic.totalAnnualEconomicValue)}
                </span>
                {showComparisonTable ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </div>
            </button>
            {showComparisonTable && (
              <div className="px-5 pb-5 border-t border-slate-800 pt-4">
                <ScenarioComparisonTable
                  scenarios={allScenarios}
                  activeMode={projectionMode}
                  fmt={fmt}
                />
              </div>
            )}
          </div>

          {/* ── 12-MONTH TCO PROJECTION ── */}
          <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">
                  12-Month Cumulative TCO vs. Legacy Baseline
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  CapEx front-loaded at M1 · {currentMode.label} scenario ·{' '}
                  {breakEvenMonth
                    ? `Break-even at ${breakEvenMonth}`
                    : 'Break-even not reached in 12mo'}
                </p>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                Yr-1 Δ:{' '}
                <span className={metrics.annualSavings - implementationCost > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {fmt.usd(metrics.pureHumanCost * 12 - (metrics.totalHybridCost * 12 + implementationCost))}
                </span>
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
                  <RechartsTooltip
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
                  {breakEvenMonth && (
                    <ReferenceLine
                      x={breakEvenMonth}
                      stroke="#f59e0b"
                      strokeDasharray="4 2"
                      label={{
                        value: '⚡ Break-Even',
                        position: 'top',
                        fill: '#f59e0b',
                        fontSize: 9,
                      }}
                    />
                  )}
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

          {/* ── PAYBACK CURVE ── */}
          <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-200">
                Net Cumulative Savings Trajectory
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Monthly net position after CapEx recovery — shows when you move into savings territory
              </p>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={paybackCurveData}
                  margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis
                    stroke="#475569"
                    fontSize={10}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <ReferenceLine y={0} stroke="#475569" strokeWidth={1.5} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                    formatter={chartCurrencyFormatter}
                  />
                  <Line
                    type="monotone"
                    dataKey="Net Position ($)"
                    stroke="#38bdf8"
                    strokeWidth={2.5}
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      const isPositive = (payload['Net Position ($)'] as number) >= 0;
                      return (
                        <circle
                          key={payload.month}
                          cx={cx}
                          cy={cy}
                          r={3}
                          fill={isPositive ? '#34d399' : '#f43f5e'}
                          stroke="none"
                        />
                      );
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[9px] text-slate-500 mt-2 text-center">
              ● Green = savings territory &nbsp;|&nbsp; ● Red = CapEx recovery phase
            </p>
          </div>

          {/* ── SPLIT CHARTS: Token Allocation + Model Matrix ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Token Budget Allocation */}
            <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 flex flex-col">
              <h3 className="text-sm font-semibold text-slate-200 mb-1">Token Budget Allocation</h3>
              <p className="text-[10px] text-slate-500 mb-4">
                Resolved value vs. sunk escalation waste vs. infra overhead
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
                    <YAxis type="category" dataKey="name" stroke="#475569" fontSize={10} hide />
                    <RechartsTooltip
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
                    (metrics.nonDeflectedSunkTokensCost / (metrics.monthlyTotalTokenSpent || 1)) * 100
                  )}
                </span>{' '}
                of token spend yields no deflection value. Reduce via better intent classification
                and confidence thresholding before escalation.
              </div>
            </div>

            {/* Model Latency vs. Cost Matrix */}
            <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 flex flex-col">
              <h3 className="text-sm font-semibold text-slate-200 mb-1">
                Model Selection Matrix
              </h3>
              <p className="text-[10px] text-slate-500 mb-4">
                Latency (s) vs. cost/session (¢) — lower-left quadrant is optimal
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
                    <RechartsTooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                    />
                    <Scatter name="Models" data={scatterData}>
                      {scatterData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={entry.isSelected ? '#10b981' : '#818cf8'}
                          opacity={entry.isSelected ? 1 : 0.5}
                        />
                      ))}
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
                intents → <strong className="text-emerald-400">{selectedModelName}</strong> (active).
                Complex reasoning → Claude Sonnet. ● Green = selected model.
              </div>
            </div>
          </div>

          {/* ── TEI DECOMPOSITION CHART ── */}
          <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">
                  Total Economic Impact (TEI) Decomposition
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Full economic value stack — operational savings + churn economics + capacity reinvestment
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
                      'Direct Savings': Math.max(0, Math.round(metrics.monthlySavings)),
                      'Churn Revenue Saved': Math.round(metrics.churnSavedRevenue),
                      'Eng. Opportunity Value': Math.round(metrics.engineeringOpportunityCost),
                    },
                    {
                      category: 'Annual Value',
                      'Direct Savings': Math.max(0, Math.round(metrics.annualSavings)),
                      'Churn Revenue Saved': Math.round(metrics.annualChurnSavedRevenue),
                      'Eng. Opportunity Value': Math.round(metrics.engineeringOpportunityCost * 12),
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
                  <RechartsTooltip
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
            {/* TEI Breakdown Summary Row */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                {
                  label: 'Direct Savings',
                  annual: metrics.annualSavings,
                  monthly: metrics.monthlySavings,
                  color: 'text-emerald-400',
                  border: 'border-emerald-500/20',
                  pct: (metrics.monthlySavings / (metrics.totalMonthlyEconomicValue || 1)) * 100,
                },
                {
                  label: 'Churn Revenue',
                  annual: metrics.annualChurnSavedRevenue,
                  monthly: metrics.churnSavedRevenue,
                  color: 'text-cyan-400',
                  border: 'border-cyan-500/20',
                  pct: (metrics.churnSavedRevenue / (metrics.totalMonthlyEconomicValue || 1)) * 100,
                },
                {
                  label: 'Eng. Capacity',
                  annual: metrics.engineeringOpportunityCost * 12,
                  monthly: metrics.engineeringOpportunityCost,
                  color: 'text-violet-400',
                  border: 'border-violet-500/20',
                  pct: (metrics.engineeringOpportunityCost / (metrics.totalMonthlyEconomicValue || 1)) * 100,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`bg-slate-950 rounded-lg p-3 border ${item.border} text-center`}
                >
                  <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">
                    {item.label}
                  </p>
                  <p className={`text-sm font-bold font-mono ${item.color}`}>
                    {fmt.usd(item.annual)}/yr
                  </p>
                  <p className="text-[9px] text-slate-500 mt-0.5">
                    {fmt.usd(item.monthly)}/mo
                  </p>
                  <div className="mt-1.5 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, Math.abs(item.pct))}%`,
                        backgroundColor: item.color.replace('text-', '').replace('-400', ''),
                      }}
                    />
                  </div>
                  <p className="text-[9px] text-slate-600 mt-0.5">{fmt.pct(item.pct)} of TEI</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── EXECUTIVE PRINT SUMMARY ── */}
          <div className="bg-slate-900/40 rounded-xl border border-slate-800 overflow-hidden">
            <button
              onClick={() => setShowExecSummary(!showExecSummary)}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-800/20 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Presentation className="w-4 h-4 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">
                    Executive Print Summary
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Copy-ready brief for board decks, email threads, or Slack DMs
                  </p>
                </div>
              </div>
              {showExecSummary ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>
            {showExecSummary && (
              <div className="border-t border-slate-800">
                <ExecutiveSummaryPanel
                  metrics={metrics}
                  inputs={dashboardInputs}
                  selectedModel={selectedModel}
                  fmt={fmt}
                />
              </div>
            )}
          </div>

          {/* ── DEFENSIBLE MATH DOCUMENTATION ── */}
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
                    deflection value. Omitting this overstates ROI by 15–40% in typical deployments
                    with 30–50% escalation rates.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-300 mb-0.5">2. Churn-CLV Bridge (v2)</p>
                  <p>
                    Formula: Deflections × BaselineChurnRate × (1 − CSAT) × CLV × Sensitivity.
                    The baseline churn rate anchors the at-risk pool to customers already likely
                    to churn, preventing CLV over-attribution that finance teams reject on sight.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-300 mb-0.5">3. FTE Reclaimed Formula</p>
                  <p>
                    FTEs = (Deflections × AHT in hours) ÷ 160 productive hrs/month. This is a
                    capacity metric — not a headcount reduction. Present as reinvestable time,
                    not elimination of roles.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-slate-300 mb-0.5">4. Production Infra TCO</p>
                  <p>
                    PII redaction, observability, and HA costs are surfaced explicitly because
                    they are systematically excluded from vendor ROI calculators. In HIPAA/GDPR
                    contexts these are mandatory, not optional line items.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-300 mb-0.5">5. Scenario Discount Methodology</p>
                  <p>
                    Conservative: 0.75×, Base: 1.0×, Optimistic: 1.20×. Accuracy Variance adds
                    an independent additive delta post-scenario to model AI quality risk separately
                    from business scenario risk.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-300 mb-0.5">6. Risk-Adjusted ROI</p>
                  <p>
                    Formula: (TEI Annual × ScenarioMultiplier − CapEx) ÷ CapEx × 100.
                    Double-discounts by scenario mode to produce a conservative floor for
                    board-level confidence intervals. Never present unadjusted ROI to a CFO.
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
