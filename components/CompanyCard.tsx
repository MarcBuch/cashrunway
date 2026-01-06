"use client";

import { useState } from "react";
import { Company } from "@/types";
import Hourglass from "./Hourglass";

interface CompanyCardProps {
  company: Company;
  onEdit?: (company: Company) => void;
  onDelete?: (id: string) => void;
}

export default function CompanyCard({
  company,
  onEdit,
  onDelete,
}: CompanyCardProps) {
  const [showCalculation, setShowCalculation] = useState(false);
  const statusColors = {
    safe: "bg-green-100 text-green-800 border-green-300",
    warning: "bg-amber-100 text-amber-800 border-amber-300",
    danger: "bg-red-100 text-red-800 border-red-300",
  };

  const ddsColors: Record<
    NonNullable<Company["risk_category"]>,
    string
  > = {
    Safe: "bg-green-100 text-green-800 border-green-300",
    Moderate: "bg-amber-100 text-amber-800 border-amber-300",
    High: "bg-orange-100 text-orange-900 border-orange-300",
    Critical: "bg-red-100 text-red-800 border-red-300",
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const hasDds =
    company.dilution_danger_score !== undefined &&
    company.risk_category !== undefined &&
    company.implied_new_shares_pct !== undefined;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-gray-900">
              {company.company_name}
            </h3>
            <span className="px-2 py-1 text-xs font-semibold bg-gray-200 text-gray-700 rounded">
              {company.ticker}
            </span>
          </div>
          <div
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[company.status]}`}
          >
            {company.status.toUpperCase()}
          </div>

          <div className="mt-2">
            {hasDds ? (
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
                  ddsColors[company.risk_category!]
                }`}
              >
                DDS {company.dilution_danger_score} • {company.risk_category}
              </span>
            ) : (
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold border bg-gray-100 text-gray-700 border-gray-300">
                DDS — (add market cap)
              </span>
            )}
          </div>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(company)}
                className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(company.id)}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        {/* Hourglass */}
        <Hourglass
          cashOnHand={company.cash_on_hand}
          quarterlyBurn={company.quarterly_burn}
          runwayMonths={company.runway_months}
        />

        {/* Metrics */}
        <div className="flex-1 grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Cash on Hand
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(company.cash_on_hand)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Quarterly Burn
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(company.quarterly_burn)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Last Reporting Date
            </div>
            <div className="text-sm font-medium text-gray-700">
              {formatDate(company.last_reporting_date)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Runway
            </div>
            <div className="text-sm font-medium text-gray-700">
              {company.runway_months === null ||
              company.runway_months === undefined ||
              !isFinite(company.runway_months)
                ? "∞"
                : `${company.runway_months.toFixed(1)} months`}
            </div>
          </div>
        </div>
      </div>

      {/* Calculation Breakdown */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => setShowCalculation(!showCalculation)}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <svg
            className={`w-4 h-4 transition-transform ${
              showCalculation ? "rotate-180" : ""
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
          {showCalculation ? "Hide" : "Show"} Calculation Details
        </button>

        {showCalculation && (
          <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Formula
                </div>
                <div className="text-sm font-mono text-gray-700 bg-white px-3 py-2 rounded border border-gray-300">
                  Runway = (Cash on Hand ÷ Quarterly Burn) × 3
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Calculation
                </div>
                <div className="text-sm text-gray-700 bg-white px-3 py-2 rounded border border-gray-300">
                  {company.quarterly_burn > 0 ? (
                    <>
                      ({formatCurrency(company.cash_on_hand)} ÷{" "}
                      {formatCurrency(company.quarterly_burn)}) × 3 ={" "}
                      <strong className="text-blue-700">
                        {company.runway_months === null ||
                        company.runway_months === undefined ||
                        !isFinite(company.runway_months)
                          ? "∞"
                          : `${company.runway_months.toFixed(1)} months`}
                      </strong>
                    </>
                  ) : (
                    <span className="text-gray-500">
                      No burn rate - infinite runway
                    </span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Risk Status
                </div>
                <div className="text-sm text-gray-700">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${statusColors[company.status]}`}
                  >
                    {company.status.toUpperCase()}
                  </span>
                  <span className="ml-2 text-gray-600">
                    {company.status === "danger" &&
                      "Less than 3 months remaining - high dilution risk"}
                    {company.status === "warning" &&
                      "3-6 months remaining - monitor closely"}
                    {company.status === "safe" &&
                      "More than 6 months remaining - lower immediate risk"}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Dilution Danger Score (DDS)
                </div>
                {hasDds ? (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-700">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          ddsColors[company.risk_category!]
                        }`}
                      >
                        {company.risk_category} • {company.dilution_danger_score}/100
                      </span>
                      <span className="ml-2 text-gray-600">
                        Implied dilution:{" "}
                        <strong className="text-gray-900">
                          {company.implied_new_shares_pct!.toFixed(1)}%
                        </strong>
                      </span>
                    </div>
                    {company.data_warning && (
                      <div className="text-xs text-amber-700">
                        Data Warning: last filing is over 120 days old.
                      </div>
                    )}
                    {company.reasoning && (
                      <div className="text-xs text-gray-600">{company.reasoning}</div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">
                    DDS requires market cap (and optional discount). Add it in Admin.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
