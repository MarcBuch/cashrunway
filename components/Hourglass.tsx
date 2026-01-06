"use client";

import { calculateCashRemainingPercentage, determineStatus } from "@/lib/utils";

interface HourglassProps {
  cashOnHand: number;
  quarterlyBurn: number;
  runwayMonths: number;
  className?: string;
}

export default function Hourglass({
  cashOnHand,
  quarterlyBurn,
  runwayMonths,
  className = "",
}: HourglassProps) {
  const percentage = calculateCashRemainingPercentage(cashOnHand, quarterlyBurn);
  const status = determineStatus(runwayMonths, cashOnHand, quarterlyBurn);
  // Flash red when status is danger or when percentage is in bottom 20%
  const isDanger = status === "danger" || percentage <= 20;

  // Determine colors based on status
  const getBarColor = () => {
    if (isDanger) {
      return "bg-red-600";
    } else if (status === "warning") {
      return "bg-amber-500";
    } else {
      return "bg-green-500";
    }
  };

  // Calculate threshold positions (using 24 months as max reference)
  // 3 months = danger threshold = 12.5% from bottom
  // 6 months = warning threshold = 25% from bottom
  const maxReasonableRunway = 24;
  const dangerThresholdPercent = Math.min(100, (3 / maxReasonableRunway) * 100);
  const warningThresholdPercent = Math.min(100, (6 / maxReasonableRunway) * 100);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Hourglass container */}
      <div className="relative w-16 h-48 bg-gray-200 rounded-lg overflow-hidden border-2 border-gray-300">
        {/* Threshold markers */}
        {quarterlyBurn > 0 && isFinite(runwayMonths) && (
          <>
            {/* Warning threshold line (6 months = 25%) */}
            <div
              className="absolute left-0 right-0 border-t-2 border-amber-400 border-dashed opacity-60 z-10"
              style={{
                bottom: `${warningThresholdPercent}%`,
              }}
              title="Warning threshold: 6 months"
            />
            {/* Danger threshold line (3 months = 12.5%) */}
            <div
              className="absolute left-0 right-0 border-t-2 border-red-500 border-dashed opacity-80 z-10"
              style={{
                bottom: `${dangerThresholdPercent}%`,
              }}
              title="Danger threshold: 3 months"
            />
          </>
        )}

        {/* Filled portion (from bottom) */}
        <div
          className={`absolute bottom-0 w-full transition-all duration-500 ${getBarColor()} ${
            isDanger ? "animate-flash-red" : ""
          }`}
          style={{
            height: `${percentage}%`,
          }}
        />
        {/* Percentage label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`text-xs font-bold ${
              percentage > 50 ? "text-white" : "text-gray-800"
            } drop-shadow`}
          >
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>
      {/* Runway months display */}
      <div className="mt-2 text-center">
        <div className="text-sm font-semibold text-gray-700">
          {runwayMonths === Infinity ? "∞" : `${runwayMonths.toFixed(1)}`} mo
        </div>
        <div className="text-xs text-gray-500">runway</div>
        {/* Threshold labels */}
        {quarterlyBurn > 0 && isFinite(runwayMonths) && (
          <div className="mt-1 text-[10px] text-gray-500 space-y-0.5">
            <div className="flex items-center justify-center gap-1">
              <div className="w-2 h-0.5 bg-amber-400 border-dashed border-t border-amber-400"></div>
              <span>6mo</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <div className="w-2 h-0.5 bg-red-500 border-dashed border-t border-red-500"></div>
              <span>3mo</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
