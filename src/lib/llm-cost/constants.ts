import type { DashboardInputs, LLMModel, ProjectionMode } from './types';

export const PRICING_AS_OF = '2026-06-01'; // surface this in the UI — pricing drifts

export const LLM_MODELS: LLMModel[] = [
  {
    name: 'Gemini 1.5 Flash', provider: 'Google',
    inputCostPer1M: 0.075, outputCostPer1M: 0.30,
    latencySeconds: 0.8, tier: 'Tier 1 (Fast/Cheap)', bestFor: 'High-volume FAQ, routing',
  },
  {
    name: 'GPT-4o Mini', provider: 'OpenAI',
    inputCostPer1M: 0.15, outputCostPer1M: 0.60,
    latencySeconds: 1.0, tier: 'Tier 1 (Fast/Cheap)', bestFor: 'Tier 1 support, classification',
  },
  {
    name: 'Claude 3.5 Haiku', provider: 'Anthropic',
    inputCostPer1M: 0.80, outputCostPer1M: 4.00,
    latencySeconds: 1.2, tier: 'Tier 2 (Balanced)', bestFor: 'Structured reasoning, policies',
  },
  {
    name: 'GPT-4o', provider: 'OpenAI',
    inputCostPer1M: 2.50, outputCostPer1M: 10.00,
    latencySeconds: 2.1, tier: 'Tier 3 (Reasoning)', bestFor: 'Complex troubleshooting',
  },
  {
    name: 'Claude 3.5 Sonnet', provider: 'Anthropic',
    inputCostPer1M: 3.00, outputCostPer1M: 15.00,
    latencySeconds: 2.3, tier: 'Tier 3 (Reasoning)', bestFor: 'High-stakes, compliance-critical',
  },
];

export const SCENARIO_MULTIPLIERS: Record<ProjectionMode, number> = {
  conservative: 0.75,
  base: 1.0,
  optimistic: 1.15,
};

// ─────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for control bounds AND validation thresholds.
// Every warn/error threshold must be reachable by its control — this is what
// prevents the "dead validation" bug class (slider max 85 vs. warning at >85).
// ─────────────────────────────────────────────────────────────────────────────
export const LIMITS = {
  ticketVolume:    { min: 250, max: 50_000, step: 250 },
  costPerLiveTicket: { min: 5, max: 75, step: 0.5 },
  deflectionGoal:  { min: 5, max: 90, step: 1, warnAbove: 70 },
  laborCaptureRate: { min: 30, max: 100, step: 5, warnAbove: 90 },
  csatPct:         { min: 40, max: 99, step: 1, errorAtOrBelow: 55 },
  baselineChurnRatePct: { min: 0.5, max: 25, step: 0.5 },
  churnAttributionFactor: { min: 0.1, max: 1.0, step: 0.05, warnAbove: 0.75 },
  ahtMinutes:      { min: 2, max: 60, step: 1 },
  tokenOverheadMultiplier: { min: 1.0, max: 1.5, step: 0.05 },
  maintenanceFteFraction: { min: 0, max: 2, step: 0.25, warnBelow: 0.25 },
  clvWarnAbove: 50_000,
  hardDeflectionCap: 0.90, // applied after scenario adjustment
} as const;

export const DEFAULT_INPUTS: DashboardInputs = {
  ticketVolume: 12_000,
  costPerLiveTicket: 18.5,
  deflectionGoal: 45,
  selectedModelName: 'GPT-4o Mini',
  laborCaptureRate: 70,

  systemPromptTokens: 600,
  userMessageTokens: 80,
  completionTokens: 250,
  turnsToResolve: 4,
  turnsToEscalate: 2,
  tokenOverheadMultiplier: 1.15,

  monthlyPlatformFee: 1_500,
  implementationCost: 25_000,
  infraPerThousandTickets: 40,
  maintenanceFteFraction: 0.5,
  maintenanceHourlyRate: 85,

  customerLifetimeValue: 1_200,
  baselineChurnRatePct: 5,
  csatPct: 82,
  churnAttributionFactor: 0.5,
  ahtMinutes: 12,
  productiveHoursPerMonth: 160,

  projectionMode: 'base',
};
