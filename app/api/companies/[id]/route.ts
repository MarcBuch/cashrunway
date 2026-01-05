import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { Company, CompanyInput } from "@/types";
import { calculateRunwayMonths, determineStatus } from "@/lib/utils";

// GET: Get a single company by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 404 }
        );
      }
      console.error("Error fetching company:", error);
      return NextResponse.json(
        { error: "Failed to fetch company" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH: Update a company
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: Partial<CompanyInput> = await request.json();

    // Build update object
    const updates: any = {};

    if (body.ticker !== undefined) updates.ticker = body.ticker;
    if (body.company_name !== undefined) updates.company_name = body.company_name;
    if (body.last_reporting_date !== undefined)
      updates.last_reporting_date = body.last_reporting_date;
    if (body.cash_on_hand !== undefined) updates.cash_on_hand = body.cash_on_hand;
    if (body.quarterly_burn !== undefined)
      updates.quarterly_burn = body.quarterly_burn;

    // If cash_on_hand or quarterly_burn changed, recalculate status
    if (body.cash_on_hand !== undefined || body.quarterly_burn !== undefined) {
      const supabase = createServerClient();
      // Get current values or use new ones
      const { data: current } = await supabase
        .from("companies")
        .select("cash_on_hand, quarterly_burn")
        .eq("id", params.id)
        .single();

      const cashOnHand =
        body.cash_on_hand !== undefined
          ? body.cash_on_hand
          : current?.cash_on_hand || 0;
      const quarterlyBurn =
        body.quarterly_burn !== undefined
          ? body.quarterly_burn
          : current?.quarterly_burn || 0;

      if (cashOnHand < 0 || quarterlyBurn < 0) {
        return NextResponse.json(
          { error: "Cash on hand and quarterly burn must be non-negative" },
          { status: 400 }
        );
      }

      const runwayMonths = calculateRunwayMonths(cashOnHand, quarterlyBurn);
      const status = determineStatus(runwayMonths, cashOnHand, quarterlyBurn);
      updates.status = status;
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("companies")
      .update(updates)
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 404 }
        );
      }
      console.error("Error updating company:", error);
      return NextResponse.json(
        { error: "Failed to update company" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a company
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const { error } = await supabase
      .from("companies")
      .delete()
      .eq("id", params.id);

    if (error) {
      console.error("Error deleting company:", error);
      return NextResponse.json(
        { error: "Failed to delete company" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
