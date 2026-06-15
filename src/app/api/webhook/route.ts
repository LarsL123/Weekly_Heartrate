import { NextRequest, NextResponse } from "next/server";
import { initSupabaseAdmin } from "@/services/database";
import { getValidAccessToken } from "@/services/auth";

// Types for Strava webhook events
interface StravaWebhookEvent {
  aspect_type: "create" | "update" | "delete";
  event_time: number;
  object_id: number;
  object_type: "activity" | "athlete";
  owner_id: number;
  subscription_id: number;
  updates?: Record<string, unknown>;
}

// Type for Strava activity streams
interface StravaStreamData {
  heartrate?: {
    data: number[];
    series_type: string;
    original_size: number;
    resolution: string;
  };
  time?: {
    data: number[];
    series_type: string;
    original_size: number;
    resolution: string;
  };
}

// Strava API return type.
interface StravaActivity {
  id: number;
  start_date: string;
  name: string;
  type: string;
  sport_type: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
}

/**
 * GET handler for Strava webhook validation
 * Strava sends a validation request when setting up the webhook subscription
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.STRAVA_VERIFY_TOKEN;

  if (!verifyToken) {
    return NextResponse.json(
      { error: "STRAVA_VERIFY_TOKEN not configured" },
      { status: 500 },
    );
  }

  // Verify the webhook subscription request
  if (mode === "subscribe" && token === verifyToken) {
    return NextResponse.json({ "hub.challenge": challenge });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

/**
 * POST handler for Strava webhook events
 * Processes new activity creation events and stores raw heartrate streams
 */
export async function POST(request: NextRequest) {
  try {
    const event: StravaWebhookEvent = await request.json();

    console.log(
      "Receved a Strava request of type ",
      event.object_type,
      "with aspect type ",
      event.aspect_type,
    );

    // Only process new activity creation events for now.
    if (event.object_type !== "activity" || event.aspect_type !== "create") {
      return NextResponse.json({ received: true });
    }

    //TODO: Could add update logic here as well if needed.

    const activityId = event.object_id;

    const supabase = initSupabaseAdmin();
    const accessToken = getValidAccessToken(supabase);

    // Fetch activity details to get start_date
    const activityResponse = await fetch(
      `https://www.strava.com/api/v3/activities/${activityId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!activityResponse.ok) {
      throw new Error(
        `Failed to fetch activity details: ${activityResponse.statusText}`,
      );
    }

    const activity: StravaActivity = await activityResponse.json();

    // Fetch raw heartrate and time streams from Strava
    const streamsResponse = await fetch(
      `https://www.strava.com/api/v3/activities/${activityId}/streams?keys=heartrate,time&key_by_type=true`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!streamsResponse.ok) {
      throw new Error(
        `Failed to fetch activity streams: ${streamsResponse.statusText}`,
      );
    }

    const streamsData: StravaStreamData = await streamsResponse.json();

    // Validate that we have both heartrate and time data
    if (!streamsData.heartrate || !streamsData.time) {
      console.log(
        `Activity ${activityId} does not have heartrate data, skipping`,
      );
      return NextResponse.json({ received: true, skipped: true });
    }

    // Extract raw time and heartrate arrays
    const rawStreams = {
      time: streamsData.time.data,
      heartrate: streamsData.heartrate.data,
    };

    // Insert raw streams into heartrate_data table
    const { error: insertError } = await supabase
      .from("activity_heartrate_data")
      .insert({
        activity_id: activityId.toString(),
        start_date: activity.start_date,
        name: activity.name,
        moving_time: activity.moving_time,
        elapsed_time: activity.elapsed_time,
        sport_type: activity.sport_type,
        distance: activity.distance,
        streams: rawStreams,
        crop_start: 0,
        crop_end: null,
      });

    if (insertError) {
      throw new Error(
        `Failed to insert heartrate data: ${insertError.message}`,
      );
    }

    return NextResponse.json({
      received: true,
      processed: true,
      activity_id: activityId,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      {
        error: "Failed to process webhook",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
