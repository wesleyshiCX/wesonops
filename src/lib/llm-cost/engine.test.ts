// Golden-scenario tests.
// Runner: vitest (or jest — swap imports accordingly).

import { describe, it, expect } from 'vitest';
import { computeFinancials, sessionTokenCost, validateInputs, getModel } from './engine';
import { DEFAULT_INPUTS, LIMITS } from './constants';

describe('engine: ROI sanity', () => {
  it('low-volume scenario (the 19,572% repro) produces a sane ROI', () => {
    const m = computeFinancials({
      ...DEFAULT_INPUTS,
      ticketVolume: 1_000,
      costPerLiveTicket: 33,
      deflectionGoal: 20,
      selectedModelName: 'GPT-4o Mini',
    });
    // At 1,000 tickets/mo with realistic overhead, this should be marginal —
    // not four digits. Bound it hard.
    expect(m.firstYearRoiPct).toBeGreaterThan(-100);
    expect(m.firstYearRoiPct).toBeLessThan(150);
  });

  it('default high-volume scenario stays under 1,000% ROI', () => {
    const m = computeFinancials(DEFAULT_INPUTS);
    expect(m.firstYearRoiPct).toBeLessThan(1_000);
    expect(m.monthlySavings).toBeGreaterThan(0);
  });

  it('extended TEI values are never silently added into ROI', () => {
    const withChurn = computeFinancials({ ...DEFAULT_INPUTS, customerLifetimeValue: 49_000 });
    const without = computeFinancials({ ...DEFAULT_INPUTS, customerLifetimeValue: 0 });
    expect(withChurn.firstYearRoiPct).toBe(without.firstYearRoiPct);
  });
});

describe('engine: validation reachability', () => {
  it('deflection warning threshold is reachable by the slider', () => {
    expect(LIMITS.deflectionGoal.warnAbove).toBeLessThan(LIMITS.deflectionGoal.max);
    const warnings = validateInputs({ ...DEFAULT_INPUTS, deflectionGoal: LIMITS.deflectionGoal.max });
    expect(warnings.some((w) => w.field === 'Deflection Goal')).toBe(true);
  });

  it('CSAT error fires at the boundary value (≤, not <)', () => {
    const warnings = validateInputs({ ...DEFAULT_INPUTS, csatPct: LIMITS.csatPct.errorAtOrBelow });
    expect(warnings.some((w) => w.severity === 'error')).toBe(true);
  });
});

describe('engine: token model', () => {
  it('session cost grows super-linearly with turns (history accumulation)', () => {
    const model = getModel('GPT-4o Mini');
    const p = { systemPromptTokens: 600, userMessageTokens: 80, completionTokens: 250, tokenOverheadMultiplier: 1 };
    const two = sessionTokenCost(model, p, 2);
    const four = sessionTokenCost(model, p, 4);
    expect(four).toBeGreaterThan(two * 2); // flat-per-turn model would be exactly 2×
  });
});
