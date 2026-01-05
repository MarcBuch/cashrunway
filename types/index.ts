export interface Company {
  id: string;
  ticker: string;
  company_name: string;
  last_reporting_date: string;
  cash_on_hand: number;
  quarterly_burn: number;
  runway_months: number;
  status: "safe" | "warning" | "danger";
  created_at?: string;
  updated_at?: string;
}

export interface CompanyInput {
  ticker: string;
  company_name: string;
  last_reporting_date: string;
  cash_on_hand: number;
  quarterly_burn: number;
}
