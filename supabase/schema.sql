-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  last_reporting_date DATE NOT NULL,
  cash_on_hand NUMERIC NOT NULL CHECK (cash_on_hand >= 0),
  quarterly_burn NUMERIC NOT NULL CHECK (quarterly_burn >= 0),
  market_cap NUMERIC NULL CHECK (market_cap IS NULL OR market_cap >= 0),
  avg_placement_discount NUMERIC NOT NULL DEFAULT 0.20 CHECK (avg_placement_discount >= 0 AND avg_placement_discount < 1),
  runway_months NUMERIC GENERATED ALWAYS AS (
    CASE 
      WHEN quarterly_burn > 0 THEN (cash_on_hand / quarterly_burn) * 3
      ELSE NULL
    END
  ) STORED,
  status TEXT NOT NULL DEFAULT 'safe' CHECK (status IN ('safe', 'warning', 'danger')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on ticker for faster lookups
CREATE INDEX IF NOT EXISTS idx_companies_ticker ON companies(ticker);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate and set status based on runway_months
CREATE OR REPLACE FUNCTION calculate_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.runway_months IS NULL OR NEW.runway_months >= 6 THEN
    NEW.status = 'safe';
  ELSIF NEW.runway_months >= 3 THEN
    NEW.status = 'warning';
  ELSE
    NEW.status = 'danger';
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically set status
CREATE TRIGGER calculate_companies_status
  BEFORE INSERT OR UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION calculate_status();

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access"
  ON companies
  FOR SELECT
  TO public
  USING (true);

-- Create policy for authenticated users to insert/update/delete
-- Note: For a public dashboard with manual entry, you may want to use service role key
-- or set up authentication. For now, we'll allow inserts via service role.
-- In production, you should restrict this based on your auth requirements.
