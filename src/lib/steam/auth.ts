import { RelyingParty } from 'openid';

const STEAM_OPENID_URL = 'https://steamcommunity.com/openid';

export function createSteamRelyingParty(returnUrl: string): RelyingParty {
  return new RelyingParty(returnUrl, null, true, true, []);
}

export function extractSteamId(claimedIdentifier: string): string | null {
  const match = claimedIdentifier.match(/https:\/\/steamcommunity\.com\/openid\/id\/(\d+)/);
  return match ? match[1] : null;
}

export function getSteamAuthUrl(): string {
  return STEAM_OPENID_URL;
}
