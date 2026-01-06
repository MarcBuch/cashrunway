The **Dilution Danger Score (DDS)** is the "Pre-emptive Strike" metric of our platform. While the Runway Clock tells you *when* a company will run out of money, the DDS tells you *how much it will hurt* the shareholder when they inevitably raise.

### The Logic Behind the Score
In junior mining, a "bad" raise is one where the company has to issue a massive amount of new shares relative to its current size to keep the lights on.

*   **Scenario A:** A company worth \$100M needs to raise \$2M. They issue 2% more shares. The stock price barely moves. (DDS: **Low/Green**)
*   **Scenario B:** A company worth \$5M needs to raise \$2M. They must issue 40% more shares, usually at a discount. The original shareholders are "washed out." (DDS: **Critical/Red**)

The DDS quantifies this "Pain Threshold" by calculating the **Implied Dilution %** required to fund the next 12 months of operations.

---

### Implementation Brief for AI Agent

**Project Name:** Dilution Danger Score (DDS) Engine
**Objective:** Calculate a 1–100 risk score representing the impact of the next capital raise on existing shareholders.

#### 1. Input Variables (JSON Schema)
The agent should expect the following inputs for a specific ticker:
*   `market_cap`: Current Market Capitalization in USD/AUD.
*   `annual_burn`: Total cash outflows over the last 4 quarters (Operating + Exploration).
*   `current_cash`: Cash and cash equivalents from the most recent filing.
*   `avg_placement_discount`: Historical average discount for this company (Default to 0.20 or 20% if unknown).

#### 2. The Core Formula
1.  **Funding Gap:** `(annual_burn - current_cash)`
    *   *Note: If result is ≤ 0, DDS is automatically Low (0-10).*
2.  **Required Raise Amount:** `Funding Gap * 1.1` (Adding a 10% "safety buffer" junior miners typically include).
3.  **Implied Dilution Percentage:** `Required Raise / (Market Cap * (1 - avg_placement_discount))`
4.  **Score Normalization:**
    *   0–5% Dilution = **Score 0–20 (Safe)**
    *   6–15% Dilution = **Score 21–50 (Moderate)**
    *   16–30% Dilution = **Score 51–80 (High Risk)**
    *   >30% Dilution = **Score 81–100 (Critical/Distress)**

#### 3. Required Output Format
The agent must return a JSON object:
```json
{
  "ticker": "string",
  "dilution_danger_score": "integer (1-100)",
  "risk_category": "Safe | Moderate | High | Critical",
  "implied_new_shares_pct": "float",
  "reasoning": "Summary sentence explaining the ratio of burn vs market cap."
}
```

#### 4. Edge Case Handling
*   **Negative Burn:** If a company is cash-flow positive (rare for juniors), return `score: 0`.
*   **Near-Zero Market Cap:** If Market Cap < Required Raise, return `score: 99` and flag as "High Bankruptcy Risk."
*   **Stale Data:** If the last filing is >120 days old, append a "Data Warning" flag.