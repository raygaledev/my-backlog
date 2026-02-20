import { NextRequest, NextResponse } from 'next/server';
import { createSteamRelyingParty, getSteamAuthUrl } from '@/lib/steam/auth';
import { randomBytes } from 'crypto';

export async function GET(request: NextRequest) {
  const baseUrl = request.nextUrl.origin;

  // Generate CSRF state token and embed it in the return URL so Steam carries it back
  const state = randomBytes(32).toString('hex');
  const returnUrl = `${baseUrl}/api/steam/callback?state=${state}`;

  const relyingParty = createSteamRelyingParty(returnUrl);

  return new Promise<NextResponse>((resolve) => {
    relyingParty.authenticate(getSteamAuthUrl(), false, (error, authUrl) => {
      if (error || !authUrl) {
        resolve(NextResponse.json({ error: 'Failed to create Steam auth URL' }, { status: 500 }));
        return;
      }

      const response = NextResponse.redirect(authUrl);

      // Set state in HTTP-only cookie (5 minute TTL)
      response.cookies.set('steam_auth_state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 300, // 5 minutes
        path: '/',
      });

      resolve(response);
    });
  });
}
