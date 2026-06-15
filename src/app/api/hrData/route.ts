import { NextRequest, NextResponse } from "next/server";
import { initSupabaseAdmin } from "@/services/database";

import { CropUpdate } from "@/types/types";

/**
 * GET /api/hrData
 * Get all activities for a specific week (Monday-Sunday)
 * Query param: week (ISO date string, e.g., "2024-01-15")
 * Returns: Array of activity_heartrate_data records
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const weekParam = searchParams.get("week");

    if (!weekParam) {
      return NextResponse.json(
        {
          error:
            "Missing 'week' query parameter. Provide an ISO date string (e.g., 2024-01-15)",
        },
        { status: 400 },
      );
    }

    const inputDate = new Date(weekParam);
    if (isNaN(inputDate.getTime())) {
      return NextResponse.json(
        {
          error: "Invalid date format. Use ISO date string (e.g., 2024-01-15)",
        },
        { status: 400 },
      );
    }

    const dayOfWeek = inputDate.getDay(); //(0 = Sunday, 1 = Monday, ..., 6 = Saturday)

    // Calculate offset to Monday (day 1)
    // If Sunday (0), offset is -6; if Monday (1), offset is 0; if Tuesday (2), offset is -1, etc.
    const offsetToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(inputDate);
    monday.setDate(inputDate.getDate() + offsetToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const supabase = initSupabaseAdmin();

    const { data, error } = await supabase
      .from("activity_heartrate_data")
      .select("*")
      .gte("start_date", monday.toISOString())
      .lte("start_date", sunday.toISOString())
      .order("start_date", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch activities", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("GET /api/hrData error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/hrData
 * Update crop_start and crop_end values for multiple activities
 * Body: Array of { activity_id, crop_start, crop_end }
 * Returns: 200 OK on success
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const updates: CropUpdate[] = await request.json();

    const error = getValidationError(updates);
    if (error != null) return NextResponse.json({ error }, { status: 400 });

    const supabase = initSupabaseAdmin();

    // N+1 round trip problem. I am not good enough in databse stuff to find good sulution here.
    const results = [];
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from("activity_heartrate_data")
        .update({
          crop_start: update.crop_start,
          crop_end: update.crop_end,
        })
        .eq("activity_id", update.activity_id);

      if (updateError) {
        return NextResponse.json(
          {
            error: `Failed to update activity ${update.activity_id}`,
            details: updateError.message,
          },
          { status: 500 },
        );
      }

      results.push({ activity_id: update.activity_id, success: true });
    }

    return NextResponse.json(
      {
        message: "Updates completed successfully",
        updated: results.length,
        results,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("POST /api/hrData error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

function getValidationError(updates: CropUpdate[]): String | null {
  if (!Array.isArray(updates)) {
    return "Request body must be an array of updates";
  }

  if (updates.length === 0) {
    return "Updates array cannot be empty";
  }

  for (const update of updates) {
    if (!update.activity_id || typeof update.activity_id !== "string") {
      return "Each update must have a valid activity_id (string)";
    }
    if (typeof update.crop_start !== "number") {
      return "Each update must have a valid crop_start (number)";
    }
    if (update.crop_end !== null && typeof update.crop_end !== "number") {
      return "crop_end must be a number or null";
    }
  }

  return null;
}
