import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (process.env.ENABLE_SETUP_ROUTES !== "true") {
    return NextResponse.json(
      {
        error: "Setup routes are disabled: Reconfigure env variables.",
      },
      { status: 403 },
    );
  }

  const clientId = process.env.STRAVA_CLIENT_ID;
  const redirectUri = process.env.STRAVA_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Missing required environment variables" },
      { status: 500 },
    );
  }

  const scope = "activity:read_all";
  const authUrl = new URL("https://www.strava.com/oauth/authorize");

  authUrl.searchParams.append("client_id", clientId);
  authUrl.searchParams.append("redirect_uri", redirectUri);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("scope", scope);

  return NextResponse.redirect(authUrl.toString());
}
