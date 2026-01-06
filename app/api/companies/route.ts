import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { Company, CompanyInput } from "@/types";
import { calculateDilutionDangerScore, calculateRunwayMonths, determineStatus } from "@/lib/utils";

// GET: List all companies
export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .order("runway_months", { ascending: true });

    if (error) {
      console.error("Error fetching companies:", error);
      return NextResponse.json(
        { error: "Failed to fetch companies" },
        { status: 500 }
      );
    }

    const companiesWithDds = (data || []).map((row: any) => {
      const marketCap = row.market_cap;
      if (marketCap === null || marketCap === undefined || Number(marketCap) <= 0) {
        return row;
      }

      const avgDiscount = row.avg_placement_discount ?? 0.2;
      const annualBurn = (row.quarterly_burn ?? 0) * 4;
      const dds = calculateDilutionDangerScore({
        ticker: row.ticker,
        market_cap: Number(marketCap),
        annual_burn: annualBurn,
        current_cash: row.cash_on_hand ?? 0,
        avg_placement_discount: avgDiscount,
        last_filing_date: row.last_reporting_date,
      });
      return { ...row, ...dds };
    });

    return NextResponse.json(companiesWithDds);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create a new company
export async function POST(request: NextRequest) {
  try {
    const body: CompanyInput = await request.json();
    const normalizedLastReportingDate =
      (body as any).last_reporting_date || (body as any).last_filing_date;

    // Validate required fields
    if (
      !body.ticker ||
      !body.company_name ||
      !normalizedLastReportingDate ||
      body.cash_on_hand === undefined ||
      body.quarterly_burn === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate numeric values
    if (body.cash_on_hand < 0 || body.quarterly_burn < 0) {
      return NextResponse.json(
        { error: "Cash on hand and quarterly burn must be non-negative" },
        { status: 400 }
      );
    }

    if (body.market_cap !== undefined && body.market_cap < 0) {
      return NextResponse.json(
        { error: "Market cap must be non-negative" },
        { status: 400 }
      );
    }

    if (
      body.avg_placement_discount !== undefined &&
      (body.avg_placement_discount < 0 || body.avg_placement_discount >= 1)
    ) {
      return NextResponse.json(
        { error: "Avg placement discount must be between 0 and 1" },
        { status: 400 }
      );
    }

    // Calculate runway and status
    const runwayMonths = calculateRunwayMonths(
      body.cash_on_hand,
      body.quarterly_burn
    );
    const status = determineStatus(
      runwayMonths,
      body.cash_on_hand,
      body.quarterly_burn
    );

    // Insert into database
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("companies")
      .insert([
        {
          ticker: body.ticker,
          company_name: body.company_name,
          last_reporting_date: normalizedLastReportingDate,
          cash_on_hand: body.cash_on_hand,
          quarterly_burn: body.quarterly_burn,
          market_cap: body.market_cap ?? null,
          avg_placement_discount: body.avg_placement_discount ?? 0.2,
          status: status,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating company:", error);
      if (error.code === "23505") {
        // Unique constraint violation
        return NextResponse.json(
          { error: "Company with this ticker already exists" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Failed to create company" },
        { status: 500 }
      );
    }

    if (data.market_cap !== null && data.market_cap !== undefined && Number(data.market_cap) > 0) {
      const dds = calculateDilutionDangerScore({
        ticker: data.ticker,
        market_cap: Number(data.market_cap),
        annual_burn: (data.quarterly_burn ?? 0) * 4,
        current_cash: data.cash_on_hand ?? 0,
        avg_placement_discount: data.avg_placement_discount ?? 0.2,
        last_filing_date: data.last_reporting_date,
      });

      return NextResponse.json({ ...data, ...dds }, { status: 201 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
