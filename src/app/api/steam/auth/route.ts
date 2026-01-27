import { NextRequest, NextResponse } from "next/server";
import { createSteamRelyingParty, getSteamAuthUrl } from "@/lib/steam/auth";

export async function GET(request: NextRequest) {
  const baseUrl = request.nextUrl.origin;
  const returnUrl = `${baseUrl}/api/steam/callback`;

  const relyingParty = createSteamRelyingParty(returnUrl);

  return new Promise<NextResponse>((resolve) => {
    relyingParty.authenticate(getSteamAuthUrl(), false, (error, authUrl) => {
      if (error || !authUrl) {
        resolve(
          NextResponse.json(
            { error: "Failed to create Steam auth URL" },
            { status: 500 }
          )
        );
        return;
      }

      resolve(NextResponse.redirect(authUrl));
    });
  });
}
