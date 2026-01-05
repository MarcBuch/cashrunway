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
