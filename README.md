# cashrunway

The Junior Miner "Cash Runway" Tracker is a high-signal tool that addresses the single biggest fear of a junior mining investor: Dilution. In the critical minerals sector, most companies are "pre-revenue." They survive by spending cash on drilling and then raising more money by issuing new shares. If you buy right before a "raise," your position is instantly devalued. This tool tells investors exactly how close that "danger zone" is.

## Core Metrics

To build this, you need to track three variables per company:
- Total Cash: (Cash + Cash Equivalents) from the latest balance sheet.
- Quarterly Burn Rate: The total cash outflow from the last 3 months. In mining, this is typically:G&A (General & Admin): Salaries, office, and "the lights."1Exploration Expenses: Money actually going "into the ground."
- Runway (Months): $\text{Months} = \left( \frac{\text{Total Cash}}{\text{Quarterly Burn}} \right) \times 3$

## Features

- The "Hourglass" UI: A vertical progress bar for each company showing cash depleting. When it hits the bottom 20%, the bar turns flashing red.

## Tech Stack

- Next.js + Tailwind + Bun
- Supabase

## Setup Instructions

### Prerequisites

- Bun installed ([install Bun](https://bun.sh))
- A Supabase account and project

### Installation

1. Install dependencies:
   ```bash
   bun install
   ```

2. Set up Supabase:
   - Create a new Supabase project or use an existing one
   - Go to the SQL Editor in your Supabase dashboard
   - Run the SQL script from `supabase/schema.sql` to create the `companies` table

3. Configure environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
     ```

4. Run the development server:
   ```bash
   bun run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Database Schema

The application uses a Supabase table called `companies` with the following structure:

- `id` (uuid, primary key)
- `ticker` (text, unique) - Stock ticker symbol
- `company_name` (text) - Full company name
- `last_reporting_date` (date) - Date of last financial report
- `cash_on_hand` (numeric) - Total cash and cash equivalents
- `quarterly_burn` (numeric) - Quarterly cash burn rate
- `runway_months` (numeric, computed) - Automatically calculated: `(cash_on_hand / quarterly_burn) * 3`
- `status` (text) - Automatically calculated: 'safe', 'warning', or 'danger'
- `created_at` (timestamp)
- `updated_at` (timestamp)

The database automatically calculates `runway_months` and `status` based on the cash metrics.

## Data model

The supabase database contains this data model for each publicly listed company.
```json
{
  "ticker": "PMT.V",
  "company_name": "Patriot Battery Metals",
  "last_reporting_date": "2025-12-31",
  "cash_on_hand": 12500000,
  "quarterly_burn": 3000000,
  "runway_months": 12.5,
  "status": "safe"
}
```

## Usage

- **Dashboard** (`/`): Public view of all companies with their cash runway metrics and hourglass visualizations
- **Admin Panel** (`/admin`): Add, edit, and delete companies