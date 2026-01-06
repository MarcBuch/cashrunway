"use client";

import { useState, useEffect } from "react";
import { Company, CompanyInput } from "@/types";
import { calculateRunwayMonths, determineStatus } from "@/lib/utils";

interface CompanyFormProps {
  company?: Company;
  onSubmit: (data: CompanyInput) => Promise<void>;
  onCancel?: () => void;
}

export default function CompanyForm({
  company,
  onSubmit,
  onCancel,
}: CompanyFormProps) {
  const [formData, setFormData] = useState<CompanyInput>({
    ticker: company?.ticker || "",
    company_name: company?.company_name || "",
    last_reporting_date:
      company?.last_reporting_date ||
      new Date().toISOString().split("T")[0],
    cash_on_hand: company?.cash_on_hand || 0,
    quarterly_burn: company?.quarterly_burn || 0,
    market_cap: company?.market_cap ?? undefined,
    avg_placement_discount: company?.avg_placement_discount ?? 0.2,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate runway on the fly
  const runwayMonths = calculateRunwayMonths(
    formData.cash_on_hand,
    formData.quarterly_burn
  );
  const status = determineStatus(
    runwayMonths,
    formData.cash_on_hand,
    formData.quarterly_burn
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save company");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "cash_on_hand" ||
        name === "quarterly_burn" ||
        name === "market_cap" ||
        name === "avg_placement_discount"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const statusColors = {
    safe: "text-green-600",
    warning: "text-amber-600",
    danger: "text-red-600",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="ticker"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Ticker *
          </label>
          <input
            type="text"
            id="ticker"
            name="ticker"
            value={formData.ticker}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            placeholder="e.g., PMT.V"
          />
        </div>

        <div>
          <label
            htmlFor="company_name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Company Name *
          </label>
          <input
            type="text"
            id="company_name"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            placeholder="e.g., Patriot Battery Metals"
          />
        </div>

        <div>
          <label
            htmlFor="last_reporting_date"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Last Filing Date *
          </label>
          <input
            type="date"
            id="last_reporting_date"
            name="last_reporting_date"
            value={formData.last_reporting_date}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          />
          <div className="mt-1 text-xs text-gray-500">
            Used for the 120-day stale data warning in DDS.
          </div>
        </div>

        <div>
          <label
            htmlFor="cash_on_hand"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Cash on Hand (USD) *
          </label>
          <input
            type="number"
            id="cash_on_hand"
            name="cash_on_hand"
            value={formData.cash_on_hand}
            onChange={handleChange}
            required
            min="0"
            step="any"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            placeholder="12500000"
          />
        </div>

        <div>
          <label
            htmlFor="quarterly_burn"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Quarterly Burn (USD) *
          </label>
          <input
            type="number"
            id="quarterly_burn"
            name="quarterly_burn"
            value={formData.quarterly_burn}
            onChange={handleChange}
            required
            min="0"
            step="any"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            placeholder="3000000"
          />
        </div>

        <div>
          <label
            htmlFor="market_cap"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Market Cap (USD)
          </label>
          <input
            type="number"
            id="market_cap"
            name="market_cap"
            value={formData.market_cap ?? ""}
            onChange={handleChange}
            min="0"
            step="any"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            placeholder="100000000"
          />
          <div className="mt-1 text-xs text-gray-500">
            Required to compute Dilution Danger Score.
          </div>
        </div>

        <div>
          <label
            htmlFor="avg_placement_discount"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Avg Placement Discount (0–1)
          </label>
          <input
            type="number"
            id="avg_placement_discount"
            name="avg_placement_discount"
            value={formData.avg_placement_discount ?? 0.2}
            onChange={handleChange}
            min="0"
            max="0.99"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            placeholder="0.20"
          />
          <div className="mt-1 text-xs text-gray-500">
            Example: 0.20 = 20% discount.
          </div>
        </div>
      </div>

      {/* Calculated fields display */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500">Calculated Runway</div>
            <div className="text-xl font-semibold text-gray-900">
              {runwayMonths === Infinity
                ? "∞"
                : `${runwayMonths.toFixed(1)} months`}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Status</div>
            <div className={`text-xl font-semibold ${statusColors[status]}`}>
              {status.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Form actions */}
      <div className="flex justify-end gap-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : company ? "Update Company" : "Add Company"}
        </button>
      </div>
    </form>
  );
}
