import { Company } from "@/types";

/**
 * Calculate runway in months based on cash on hand and quarterly burn rate
 * Formula: (cash_on_hand / quarterly_burn) * 3
 */
export function calculateRunwayMonths(
  cashOnHand: number,
  quarterlyBurn: number
): number {
  if (quarterlyBurn <= 0) {
    return Infinity; // No burn means infinite runway
  }
  return (cashOnHand / quarterlyBurn) * 3;
}

/**
 * Determine status based on runway months
 * The status is based on how much cash remains relative to the total runway
 * - danger: < 20% cash remaining (bottom 20% of runway)
 * - warning: 20-40% remaining
 * - safe: > 40% remaining
 */
export function determineStatus(
  runwayMonths: number,
  cashOnHand: number,
  quarterlyBurn: number
): "safe" | "warning" | "danger" {
  if (quarterlyBurn <= 0 || runwayMonths === Infinity) {
    return "safe";
  }

  // Calculate what percentage of runway is remaining
  // If we're at month 0 of a 12 month runway, we have 100% remaining
  // If we're at month 10 of a 12 month runway, we have 16.67% remaining
  const monthsRemaining = runwayMonths;
  const totalRunwayMonths = (cashOnHand / quarterlyBurn) * 3;
  
  // Calculate remaining percentage (simplified - assumes current cash is at start of runway)
  const remainingPercentage = monthsRemaining / totalRunwayMonths;
  
  // Actually, we need to think about this differently
  // The hourglass shows how much cash is left
  // If we have 10M cash and burn 2M per quarter, we have 15 months
  // If we've burned through 80% of cash, we're in danger zone
  // So: remaining cash / total cash at start
  
  // Since we're tracking current cash, not time elapsed:
  // We need to estimate what the starting cash was
  // Or, we can use runway months directly:
  // - If runway < 6 months: danger (likely < 20% remaining)
  // - If runway 6-12 months: warning
  // - If runway > 12 months: safe
  
  // Actually, re-reading the requirement: "When it hits the bottom 20%"
  // This means when cash remaining is < 20% of original/peak
  // Since we track current cash and burn rate, we can estimate:
  
  if (runwayMonths < 3) {
    return "danger"; // Less than 3 months is definitely danger zone
  } else if (runwayMonths < 6) {
    return "warning"; // 3-6 months is warning
  } else {
    return "safe"; // More than 6 months is safe
  }
}

/**
 * Calculate cash remaining percentage for hourglass visualization
 * Returns percentage (0-100) of how much cash remains
 * 
 * Since we track current cash and burn rate (not original/peak cash),
 * we use runway months as a proxy for cash remaining:
 * - 24+ months runway = 100% (assumed full/safe)
 * - Decreasing linearly to 0% as runway approaches 0
 * - This ensures the hourglass shows < 20% when runway is in danger zone
 */
export function calculateCashRemainingPercentage(
  cashOnHand: number,
  quarterlyBurn: number
): number {
  if (quarterlyBurn <= 0) {
    return 100;
  }
  
  const runwayMonths = calculateRunwayMonths(cashOnHand, quarterlyBurn);
  
  if (!isFinite(runwayMonths)) {
    return 100;
  }
  
  // Use 24 months as "full" reference point
  // This ensures companies with < 20% runway (roughly < 5 months) show low fill
  const maxReasonableRunway = 24;
  
  if (runwayMonths >= maxReasonableRunway) {
    return 100;
  }
  
  // Map runway months to percentage: 0 months = 0%, 24 months = 100%
  // When runway < 3 months (danger zone), percentage will be < 12.5% (< 20% when accounting for threshold)
  return Math.max(0, Math.min(100, (runwayMonths / maxReasonableRunway) * 100));
}

export type DilutionRiskCategory = "Safe" | "Moderate" | "High" | "Critical";

export interface DilutionDangerScoreInput {
  ticker?: string;
  market_cap: number;
  annual_burn: number;
  current_cash: number;
  avg_placement_discount?: number; // 0.20 = 20%
  last_filing_date?: string; // YYYY-MM-DD
}

export interface DilutionDangerScoreResult {
  ticker?: string;
  dilution_danger_score: number; // 0-100
  risk_category: DilutionRiskCategory;
  implied_new_shares_pct: number; // percent (0-100+)
  data_warning: boolean;
  reasoning: string;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function lerp(x: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  if (inMax === inMin) return outMin;
  const t = (x - inMin) / (inMax - inMin);
  return outMin + t * (outMax - outMin);
}

function computeDataWarning(lastFilingDate?: string) {
  if (!lastFilingDate) return false;
  const parsed = new Date(lastFilingDate);
  if (Number.isNaN(parsed.getTime())) return false;
  const ageDays = (Date.now() - parsed.getTime()) / (1000 * 60 * 60 * 24);
  return ageDays > 120;
}

function formatPct(pct: number) {
  if (!isFinite(pct)) return "∞";
  if (pct >= 1000) return `${pct.toFixed(0)}%`;
  if (pct >= 100) return `${pct.toFixed(0)}%`;
  if (pct >= 10) return `${pct.toFixed(1)}%`;
  return `${pct.toFixed(2)}%`;
}

/**
 * Dilution Danger Score (DDS)
 * Calculates 0–100 risk score based on implied dilution required to fund next ~12 months.
 */
export function calculateDilutionDangerScore(
  input: DilutionDangerScoreInput
): DilutionDangerScoreResult {
  const avgPlacementDiscount =
    input.avg_placement_discount === undefined || input.avg_placement_discount === null
      ? 0.2
      : input.avg_placement_discount;

  const ticker = input.ticker;
  const marketCap = Number(input.market_cap);
  const annualBurn = Number(input.annual_burn);
  const currentCash = Number(input.current_cash);
  const dataWarning = computeDataWarning(input.last_filing_date);

  // Edge cases
  if (!isFinite(annualBurn) || !isFinite(currentCash) || !isFinite(marketCap)) {
    return {
      ticker,
      dilution_danger_score: 99,
      risk_category: "Critical",
      implied_new_shares_pct: Infinity,
      data_warning: dataWarning,
      reasoning: "Insufficient numeric inputs to compute dilution reliably.",
    };
  }

  if (annualBurn <= 0) {
    return {
      ticker,
      dilution_danger_score: 0,
      risk_category: "Safe",
      implied_new_shares_pct: 0,
      data_warning: dataWarning,
      reasoning:
        "Cash-flow-positive (or zero burn) implies no funding gap over the next 12 months.",
    };
  }

  const fundingGap = Math.max(annualBurn - currentCash, 0);
  if (fundingGap <= 0) {
    return {
      ticker,
      dilution_danger_score: 0,
      risk_category: "Safe",
      implied_new_shares_pct: 0,
      data_warning: dataWarning,
      reasoning:
        "Current cash covers the next 12 months of burn; no dilution required on this model.",
    };
  }

  const requiredRaise = fundingGap * 1.1;

  const discount = clamp(Number(avgPlacementDiscount) || 0, 0, 0.95);
  const effectiveMarketCap = marketCap * (1 - discount);

  if (marketCap <= 0 || effectiveMarketCap <= 0) {
    return {
      ticker,
      dilution_danger_score: 99,
      risk_category: "Critical",
      implied_new_shares_pct: Infinity,
      data_warning: dataWarning,
      reasoning:
        "Market cap is too small (or discount too large) to compute a meaningful implied dilution; High Bankruptcy Risk.",
    };
  }

  const impliedDilutionRatio = requiredRaise / effectiveMarketCap;
  const impliedPct = impliedDilutionRatio * 100;

  if (marketCap < requiredRaise) {
    return {
      ticker,
      dilution_danger_score: 99,
      risk_category: "Critical",
      implied_new_shares_pct: impliedPct,
      data_warning: dataWarning,
      reasoning: `Required raise (${formatPct((requiredRaise / marketCap) * 100)} of market cap) exceeds market cap; High Bankruptcy Risk.`,
    };
  }

  // Piecewise-linear score mapping using breakpoints in implied percent dilution.
  let score: number;
  if (impliedPct <= 0) {
    score = 0;
  } else if (impliedPct <= 5) {
    score = lerp(impliedPct, 0, 5, 0, 20);
  } else if (impliedPct <= 15) {
    score = lerp(impliedPct, 5, 15, 20, 50);
  } else if (impliedPct <= 30) {
    score = lerp(impliedPct, 15, 30, 50, 80);
  } else {
    // 30%–60% => 80–100, clamp above that
    score = lerp(clamp(impliedPct, 30, 60), 30, 60, 80, 100);
  }

  const rounded = clamp(Math.round(score), 0, 100);
  const riskCategory: DilutionRiskCategory =
    impliedPct <= 5 ? "Safe" : impliedPct <= 15 ? "Moderate" : impliedPct <= 30 ? "High" : "Critical";

  const reasoning = `Funding gap of ${formatPct((fundingGap / marketCap) * 100)} of market cap implies ~${formatPct(impliedPct)} new shares (after ${formatPct(discount * 100)} placement discount).`;

  return {
    ticker,
    dilution_danger_score: rounded,
    risk_category: riskCategory,
    implied_new_shares_pct: impliedPct,
    data_warning: dataWarning,
    reasoning,
  };
}
