// Pure type definitions. No React, no UI concerns.

export type ProjectionMode = 'conservative' | 'base' | 'optimistic';

export interface LLMModel {
  name: string;
  provider: string;
  inputCostPer1M: number;   // USD per 1M input tokens
  outputCostPer1M: number;  // USD per 1M output tokens
  latencySeconds: number;
  tier: string;
  bestFor: string;
}

export interface DashboardInputs {
  // Operations
  ticketVolume: number;
  costPerLiveTicket: number;        // fully-loaded $/ticket
  deflectionGoal: number;           // % 0–100
  selectedModelName: string;
  laborCaptureRate: number;         // % of avoided labor actually bankable

  // Token model
  systemPromptTokens: number;       // system prompt + RAG context, resent every turn
  userMessageTokens: number;        // avg user message per turn
  completionTokens: number;         // avg model output per turn
  turnsToResolve: number;
  turnsToEscalate: number;
  tokenOverheadMultiplier: number;  // retries, guardrails, eval traffic (1.0–1.5)

  // Platform & infrastructure
  monthlyPlatformFee: number;
  implementationCost: number;       // one-time CapEx
  infraPerThousandTickets: number;  // PII/observability/HA, scales with volume
  maintenanceFteFraction: number;   // FTE fraction maintaining prompts/KB/evals
  maintenanceHourlyRate: number;

  // Extended TEI (reported separately — never in headline ROI)
  customerLifetimeValue: number;
  baselineChurnRatePct: number;     // % 0–100
  csatPct: number;                  // % 0–100
  churnAttributionFactor: number;   // 0–1, dedupes repeat contacts
  ahtMinutes: number;
  productiveHoursPerMonth: number;

  projectionMode: ProjectionMode;
}

export interface ValidationWarning {
  field: string;
  message: string;
  severity: 'warn' | 'error';
}

export interface ComputedFinancials {
  // Volume
  effectiveDeflectionRate: number;  // 0–1
  deflections: number;
  escalations: number;

  // Token economics
  costPerResolvedSession: number;
  costPerEscalatedSession: number;
  resolvedTokenSpend: number;
  escalatedTokenSpend: number;      // sunk cost
  monthlyTokenSpend: number;

  // Infrastructure
  maintenanceCost: number;
  scaledInfraCost: number;
  totalMonthlyInfraCost: number;
  totalMonthlyAICost: number;       // tokens + all infra

  // Core financials (the defensible numbers)
  grossLaborAvoided: number;        // monthly, after capture rate
  monthlySavings: number;           // grossLaborAvoided − totalMonthlyAICost
  annualSavings: number;
  loadedCostPerDeflection: number;
  paybackMonths: number;            // Infinity if never
  firstYearRoiPct: number;          // honest denominator: CapEx + 12mo OpEx

  // Extended TEI (excluded from ROI, shown with caveats)
  customersSavedPerMonth: number;
  churnValueMonthly: number;
  churnValueAnnual: number;
  hoursReclaimedMonthly: number;
  ftesReclaimed: number;
  capacityValueMonthly: number;

  warnings: ValidationWarning[];
}
