import { NextRequest, NextResponse } from "next/server";

// Type for Strava subscription response
interface StravaSubscriptionResponse {
  id: number;
  resource_state: number;
  application_id: number;
  callback_url: string;
  created_at: string;
  updated_at: string;
}

// Type for Strava error response
interface StravaErrorResponse {
  message: string;
  errors?: Array<{
    resource: string;
    field: string;
    code: string;
  }>;
}

/**
 * GET handler to register webhook subscription with Strava
 * This is a one-time setup endpoint - visit it in your browser to create the subscription
 */
export async function GET(request: NextRequest) {
  if (process.env.ENABLE_SETUP_ROUTES !== "true") {
    return NextResponse.json(
      {
        error: "Setup routes are disabled: Reconfigure env variables.",
      },
      { status: 403 },
    );
  }

  try {
    const clientId = process.env.STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET;
    const verifyToken = process.env.STRAVA_VERIFY_TOKEN;
    const callbackUrl = process.env.STRAVA_CALLBACK_URL;

    // Validate required environment variables
    if (!clientId || !clientSecret || !verifyToken || !callbackUrl) {
      return NextResponse.json(
        {
          error: "Missing required environment variables",
          required: [
            "STRAVA_CLIENT_ID",
            "STRAVA_CLIENT_SECRET",
            "STRAVA_VERIFY_TOKEN",
            "STRAVA_CALLBACK_URL",
          ],
        },
        { status: 500 },
      );
    }

    // Prepare subscription request parameters
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      callback_url: callbackUrl,
      verify_token: verifyToken,
    });

    // Make POST request to Strava's subscription endpoint
    const response = await fetch(
      "https://www.strava.com/api/v3/push_subscriptions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      },
    );

    const responseData = await response.json();

    if (!response.ok) {
      const errorData = responseData as StravaErrorResponse;
      return NextResponse.json(
        {
          error: "Failed to create Strava subscription",
          status: response.status,
          message: errorData.message,
          details: errorData.errors,
        },
        { status: response.status },
      );
    }

    const subscriptionData = responseData as StravaSubscriptionResponse;

    return NextResponse.json({
      success: true,
      message: "Webhook subscription created successfully",
      subscription: {
        id: subscriptionData.id,
        callback_url: subscriptionData.callback_url,
        created_at: subscriptionData.created_at,
        application_id: subscriptionData.application_id,
      },
    });
  } catch (error) {
    console.error("Subscription creation error:", error);
    return NextResponse.json(
      {
        error: "Failed to create subscription",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
