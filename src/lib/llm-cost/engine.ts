// ============================================================================
// PURE COMPUTATION ENGINE — zero React imports, fully unit-testable.
// ============================================================================

import type {
    ComputedFinancials,
    DashboardInputs,
    LLMModel,
    ProjectionMode,
    ValidationWarning,
  } from './types';
  import { LIMITS, LLM_MODELS, SCENARIO_MULTIPLIERS } from './constants';
  
  export function getModel(name: string): LLMModel {
    return LLM_MODELS.find((m) => m.name === name) ?? LLM_MODELS[1];
  }
  
  // ── TOKEN MODEL ──────────────────────────────────────────────────────────────
  // Each turn's prompt includes the system prompt + RAG context PLUS the entire
  // accumulated conversation history. A flat per-turn token count understates
  // real session cost by 2–4×; this models the actual quadratic-ish growth.
  export function sessionTokenCost(
    model: LLMModel,
    p: { systemPromptTokens: number; userMessageTokens: number; completionTokens: number; tokenOverheadMultiplier: number },
    turns: number
  ): number {
    let inputTokens = 0;
    let outputTokens = 0;
    for (let t = 1; t <= turns; t++) {
      const history = (t - 1) * (p.userMessageTokens + p.completionTokens);
      inputTokens += p.systemPromptTokens + p.userMessageTokens + history;
      outputTokens += p.completionTokens;
    }
    const raw =
      (inputTokens * model.inputCostPer1M) / 1_000_000 +
      (outputTokens * model.outputCostPer1M) / 1_000_000;
    // Overhead: retries, guardrail/classification pre-flight calls, eval traffic.
    return raw * p.tokenOverheadMultiplier;
  }
  
  // ── INPUT VALIDATION ─────────────────────────────────────────────────────────
  // Every threshold here references LIMITS, which also drives the UI controls.
  // If a control can't reach a threshold, that's now a structural impossibility.
  export function validateInputs(inputs: DashboardInputs): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];
  
    if (inputs.deflectionGoal > LIMITS.deflectionGoal.warnAbove) {
      warnings.push({
        field: 'Deflection Goal',
        severity: 'warn',
        message: `Deflection >${LIMITS.deflectionGoal.warnAbove}% is rare outside narrow FAQ domains. Validate with a 30-day pilot before presenting to the board.`,
      });
    }
    if (inputs.csatPct <= LIMITS.csatPct.errorAtOrBelow) {
      warnings.push({
        field: 'AI Resolution CSAT',
        severity: 'error',
        message: `CSAT ≤${LIMITS.csatPct.errorAtOrBelow}% signals model-quality problems. Direct savings may be offset by churn and re-contact volume.`,
      });
    }
    if (inputs.customerLifetimeValue > LIMITS.clvWarnAbove) {
      warnings.push({
        field: 'Customer LTV',
        severity: 'warn',
        message: 'CLV >$50K implies enterprise contracts — confirm churn attribution methodology with finance before using the extended TEI figure.',
      });
    }
    if (inputs.laborCaptureRate > LIMITS.laborCaptureRate.warnAbove) {
      warnings.push({
        field: 'Labor Capture Rate',
        severity: 'warn',
        message: 'Capture rates >90% assume perfectly elastic staffing. Most teams realize 60–80% of avoided handle-time as actual savings.',
      });
    }
    if (inputs.maintenanceFteFraction < LIMITS.maintenanceFteFraction.warnBelow) {
      warnings.push({
        field: 'Maintenance FTE',
        severity: 'warn',
        message: 'Production AI systems require ongoing prompt/KB/eval maintenance. Budgeting <0.25 FTE is a common cause of post-launch quality decay.',
      });
    }
    return warnings;
  }
  
  // ── MAIN COMPUTATION ─────────────────────────────────────────────────────────
  export function computeFinancials(inputs: DashboardInputs): ComputedFinancials {
    const model = getModel(inputs.selectedModelName);
    const warnings = validateInputs(inputs);
    const scenarioMult = SCENARIO_MULTIPLIERS[inputs.projectionMode];
  
    // Volume — scenario multiplier applied exactly ONCE, here.
    const effectiveDeflectionRate = Math.min(
      LIMITS.hardDeflectionCap,
      Math.max(0, (inputs.deflectionGoal / 100) * scenarioMult)
    );
    const deflections = Math.round(inputs.ticketVolume * effectiveDeflectionRate);
    const escalations = inputs.ticketVolume - deflections;
  
    // Token economics — escalated sessions are modeled as sunk cost.
    const tokenParams = {
      systemPromptTokens: inputs.systemPromptTokens,
      userMessageTokens: inputs.userMessageTokens,
      completionTokens: inputs.completionTokens,
      tokenOverheadMultiplier: inputs.tokenOverheadMultiplier,
    };
    const costPerResolvedSession = sessionTokenCost(model, tokenParams, inputs.turnsToResolve);
    const costPerEscalatedSession = sessionTokenCost(model, tokenParams, inputs.turnsToEscalate);
    const resolvedTokenSpend = deflections * costPerResolvedSession;
    const escalatedTokenSpend = escalations * costPerEscalatedSession;
    const monthlyTokenSpend = resolvedTokenSpend + escalatedTokenSpend;
  
    // Infrastructure — partially volume-scaled, plus the maintenance headcount
    // that vendor calculators always omit.
    const scaledInfraCost = inputs.infraPerThousandTickets * (inputs.ticketVolume / 1000);
    const maintenanceCost =
      inputs.maintenanceFteFraction * inputs.maintenanceHourlyRate * inputs.productiveHoursPerMonth;
    const totalMonthlyInfraCost = inputs.monthlyPlatformFee + scaledInfraCost + maintenanceCost;
    const totalMonthlyAICost = monthlyTokenSpend + totalMonthlyInfraCost;
  
    // Core savings — labor capture rate discounts avoided handle-time, because
    // staffing isn't perfectly elastic (you can't bank fractional agent-hours).
    const grossLaborAvoided =
      deflections * inputs.costPerLiveTicket * (inputs.laborCaptureRate / 100);
    const monthlySavings = grossLaborAvoided - totalMonthlyAICost;
    const annualSavings = monthlySavings * 12;
  
    const loadedCostPerDeflection = deflections > 0 ? totalMonthlyAICost / deflections : 0;
    const paybackMonths =
      monthlySavings > 0 ? Number((inputs.implementationCost / monthlySavings).toFixed(1)) : Infinity;
  
    // ── FIRST-YEAR ROI (the fix for the 19,572% bug) ──────────────────────────
    // Benefit:  12 months of captured labor avoidance (recurring).
    // Cost:     one-time CapEx + 12 months of ALL AI operating costs.
    // The old formula divided annual recurring value by CapEx alone, which
    // produces four-digit percentages for any nonzero benefit. This denominator
    // is what a finance team will actually compute.
    const firstYearCost = inputs.implementationCost + totalMonthlyAICost * 12;
    const firstYearBenefit = grossLaborAvoided * 12;
    const firstYearRoiPct =
      firstYearCost > 0 ? ((firstYearBenefit - firstYearCost) / firstYearCost) * 100 : 0;
  
    // ── EXTENDED TEI — reported separately, NEVER added into ROI ──────────────
    // Churn: at-risk pool anchored to baseline churn, discounted by an
    // attribution factor (repeat contacts ≠ distinct customers). Each saved
    // customer is worth CLV once.
    const customersSavedPerMonth =
      deflections *
      (inputs.baselineChurnRatePct / 100) *
      (1 - inputs.csatPct / 100) *
      inputs.churnAttributionFactor;
    const churnValueMonthly = customersSavedPerMonth * inputs.customerLifetimeValue;
    const churnValueAnnual = churnValueMonthly * 12;
  
    // Capacity: hours reclaimed. This OVERLAPS with grossLaborAvoided —
    // it is the same labor expressed as capacity, which is exactly why it is
    // excluded from ROI. Present as narrative ("what we'll do with the time"),
    // not as additive dollars.
    const hoursReclaimedMonthly = (deflections * inputs.ahtMinutes) / 60;
    const ftesReclaimed =
      inputs.productiveHoursPerMonth > 0
        ? hoursReclaimedMonthly / inputs.productiveHoursPerMonth
        : 0;
    const capacityValueMonthly =
      hoursReclaimedMonthly * inputs.maintenanceHourlyRate;
  
    // Computed-value warning: negative unit economics.
    if (totalMonthlyAICost >= grossLaborAvoided && deflections > 0) {
      warnings.push({
        field: 'Unit Economics',
        severity: 'error',
        message: `Monthly AI cost (${Math.round(totalMonthlyAICost).toLocaleString()}) meets or exceeds captured labor savings (${Math.round(grossLaborAvoided).toLocaleString()}). At this volume the program does not pay for itself — increase volume, deflection, or reduce fixed overhead.`,
      });
    }
  
    return {
      effectiveDeflectionRate,
      deflections,
      escalations,
      costPerResolvedSession,
      costPerEscalatedSession,
      resolvedTokenSpend,
      escalatedTokenSpend,
      monthlyTokenSpend,
      maintenanceCost,
      scaledInfraCost,
      totalMonthlyInfraCost,
      totalMonthlyAICost,
      grossLaborAvoided,
      monthlySavings,
      annualSavings,
      loadedCostPerDeflection,
      paybackMonths,
      firstYearRoiPct,
      customersSavedPerMonth,
      churnValueMonthly,
      churnValueAnnual,
      hoursReclaimedMonthly,
      ftesReclaimed,
      capacityValueMonthly,
      warnings,
    };
  }
  
  export function computeAllScenarios(
    inputs: DashboardInputs
  ): Record<ProjectionMode, ComputedFinancials> {
    return {
      conservative: computeFinancials({ ...inputs, projectionMode: 'conservative' }),
      base: computeFinancials({ ...inputs, projectionMode: 'base' }),
      optimistic: computeFinancials({ ...inputs, projectionMode: 'optimistic' }),
    };
  }
  