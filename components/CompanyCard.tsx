"use client";

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
  const statusColors = {
    safe: "bg-green-100 text-green-800 border-green-300",
    warning: "bg-amber-100 text-amber-800 border-amber-300",
    danger: "bg-red-100 text-red-800 border-red-300",
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
    </div>
  );
}
