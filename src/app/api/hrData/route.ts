import { NextRequest, NextResponse } from "next/server";
import { initSupabaseAdmin } from "@/services/database";

import { CropState } from "@/types/types";

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
 * Body: A CropState object is JSON format.
 * Returns: 200 OK on success
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const updates: CropState = await request.json();

    const error = getValidationError(updates);
    if (error != null) return NextResponse.json({ error }, { status: 400 });

    const supabase = initSupabaseAdmin();

    // N+1 round trip problem. I am not good enough in databse stuff to find good sulution here.
    const results = [];
    for (const [activityId, update] of Object.entries(updates)) {
      const { error: updateError } = await supabase
        .from("activity_heartrate_data")
        .update({
          crop_start: update.cropStart,
          crop_end: update.cropEnd,
        })
        .eq("activity_id", activityId);

      if (updateError) {
        return NextResponse.json(
          {
            error: `Failed to update activity ${activityId}`,
            details: updateError.message,
          },
          { status: 500 },
        );
      }

      results.push({ activity_id: activityId, success: true });
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

function getValidationError(updates: unknown): string | null {
  if (
    typeof updates !== "object" ||
    updates === null ||
    Array.isArray(updates)
  ) {
    return "Request body must be an object";
  }

  if (Object.keys(updates).length === 0) {
    return "Updates object cannot be empty";
  }

  for (const [activityId, update] of Object.entries(updates)) {
    if (!activityId) {
      return "Activity IDs must be non-empty strings";
    }

    if (typeof update.cropStart !== "number") {
      return `Activity ${activityId} must have a valid cropStart (number)`;
    }

    if (update.cropEnd !== null && typeof update.cropEnd !== "number") {
      return `Activity ${activityId} cropEnd must be a number or null`;
    }
  }

  return null;
}
