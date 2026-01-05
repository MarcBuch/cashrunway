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

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Hourglass container */}
      <div className="relative w-16 h-48 bg-gray-200 rounded-lg overflow-hidden border-2 border-gray-300">
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
      </div>
    </div>
  );
}
