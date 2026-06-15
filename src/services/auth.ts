import { SupabaseClient } from "@supabase/supabase-js";

interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
  token_type: string;
}

interface StravaAuth {
  id: number;
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

export async function getValidAccessToken(supabase: SupabaseClient) {
  const { data: authData, error: authError } = await supabase
    .from("strava_auth")
    .select("*")
    .eq("id", 1)
    .single();

  if (authError || !authData) {
    throw new Error(`Failed to fetch auth data: ${authError?.message}`);
  }

  const auth = authData as StravaAuth;

  const expiresAt = new Date(auth.expires_at).getTime();
  const currentTime = Date.now();
  let accessToken = auth.access_token;

  if (currentTime >= expiresAt) {
    // Token is expired, refresh it
    accessToken = await refreshAccessToken(auth.refresh_token, supabase);
  }

  return accessToken;
}

async function refreshAccessToken(
  refreshToken: string,
  supabase: SupabaseClient,
): Promise<string> {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Strava client credentials");
  }

  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token refresh failed: ${errorText}`);
  }

  const tokenData: StravaTokenResponse = await response.json();

  // Update the auth record with new tokens
  const { error: updateError } = await supabase
    .from("strava_auth")
    .update({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: new Date(tokenData.expires_at * 1000).toISOString(),
    })
    .eq("id", 1);

  if (updateError) {
    throw new Error(`Failed to update tokens: ${updateError.message}`);
  }

  return tokenData.access_token;
}
