import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { Company, CompanyInput } from "@/types";
import { calculateRunwayMonths, determineStatus } from "@/lib/utils";

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

    return NextResponse.json(data || []);
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

    // Validate required fields
    if (
      !body.ticker ||
      !body.company_name ||
      !body.last_reporting_date ||
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
          last_reporting_date: body.last_reporting_date,
          cash_on_hand: body.cash_on_hand,
          quarterly_burn: body.quarterly_burn,
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

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
