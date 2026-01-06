export interface Company {
  id: string;
  ticker: string;
  company_name: string;
  last_reporting_date: string;
  cash_on_hand: number;
  quarterly_burn: number;
  runway_months: number;
  status: "safe" | "warning" | "danger";
  // DDS inputs
  market_cap?: number | null;
  avg_placement_discount?: number | null; // 0.20 = 20%
  // DDS outputs (computed server-side)
  dilution_danger_score?: number;
  risk_category?: "Safe" | "Moderate" | "High" | "Critical";
  implied_new_shares_pct?: number;
  data_warning?: boolean;
  reasoning?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CompanyInput {
  ticker: string;
  company_name: string;
  // Accept either name; API will normalize to last_reporting_date
  last_reporting_date?: string;
  last_filing_date?: string;
  cash_on_hand: number;
  quarterly_burn: number;
  market_cap?: number;
  avg_placement_discount?: number;
}

export type DilutionRiskCategory = "Safe" | "Moderate" | "High" | "Critical";
