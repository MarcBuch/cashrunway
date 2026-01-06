"use client";

import { useState } from "react";

export default function RiskExplanation() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-2 border-blue-200 mb-8">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            How is Risk Calculated?
          </h2>
          <p className="text-sm text-gray-600">
            Understanding cash runway and dilution risk
          </p>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-6 space-y-6 pt-6 border-t border-gray-200">
          {/* Formula Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Cash Runway Formula
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-700 mb-2">
                <strong>Runway (Months)</strong> = (Cash on Hand ÷ Quarterly Burn) × 3
              </div>
              <div className="text-xs text-gray-600 mt-2">
                This tells you how many months a company can operate before running out of cash,
                assuming the current burn rate continues.
              </div>
            </div>
          </div>

          {/* Risk Thresholds */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Risk Status Thresholds
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex-shrink-0 w-3 h-3 rounded-full bg-red-600 mt-1.5"></div>
                <div className="flex-1">
                  <div className="font-semibold text-red-900">DANGER</div>
                  <div className="text-sm text-red-700">
                    Less than 3 months of runway remaining. The company is likely to raise capital
                    soon, which could dilute your shares.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex-shrink-0 w-3 h-3 rounded-full bg-amber-500 mt-1.5"></div>
                <div className="flex-1">
                  <div className="font-semibold text-amber-900">WARNING</div>
                  <div className="text-sm text-amber-700">
                    3-6 months of runway remaining. Monitor closely as the company may need to
                    raise capital in the near term.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex-shrink-0 w-3 h-3 rounded-full bg-green-500 mt-1.5"></div>
                <div className="flex-1">
                  <div className="font-semibold text-green-900">SAFE</div>
                  <div className="text-sm text-green-700">
                    More than 6 months of runway remaining. Lower immediate dilution risk.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Why This Matters */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Why This Matters
            </h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p>
                Junior mining companies are typically pre-revenue and survive by spending cash on
                exploration, then raising more money by issuing new shares. If you buy shares right
                before a capital raise, your position is instantly diluted.
              </p>
              <p>
                This tool helps you identify when a company is approaching the "danger zone" where
                a capital raise becomes likely, allowing you to make more informed investment
                decisions.
              </p>
            </div>
          </div>

          {/* DDS Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Dilution Danger Score (DDS)
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
              <div className="text-sm text-gray-700">
                DDS estimates how painful the next raise could be by modeling the implied dilution
                needed to fund ~12 months of burn.
              </div>
              <div className="text-sm text-gray-700">
                <strong>Funding Gap</strong> = max(Annual Burn − Current Cash, 0)
                <br />
                <strong>Required Raise</strong> = Funding Gap × 1.1
                <br />
                <strong>Implied Dilution</strong> = Required Raise ÷ (Market Cap × (1 − Discount))
              </div>
              <div className="text-xs text-gray-600">
                <strong>Stale Data Warning:</strong> if the last filing date is over 120 days old,
                the DDS includes a warning flag.
              </div>
            </div>
          </div>

          {/* Example Calculation */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Example Calculation
            </h3>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-sm text-gray-700 space-y-2">
                <div>
                  <strong>Cash on Hand:</strong> $12,500,000
                </div>
                <div>
                  <strong>Quarterly Burn:</strong> $3,000,000
                </div>
                <div className="pt-2 border-t border-blue-200">
                  <strong>Runway:</strong> ($12,500,000 ÷ $3,000,000) × 3 ={" "}
                  <strong className="text-blue-700">12.5 months</strong>
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  Status: <span className="font-semibold text-green-700">SAFE</span> (more than 6
                  months remaining)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
