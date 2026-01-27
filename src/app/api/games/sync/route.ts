import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGameDetails, extractGameMetadata } from "@/lib/steam/store-api";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { appId } = await request.json();

  if (!appId) {
    return NextResponse.json({ error: "Missing appId" }, { status: 400 });
  }

  // Fetch game details from Steam Store API
  const details = await getGameDetails(appId);
  const metadata = details ? extractGameMetadata(details) : null;

  if (metadata) {
    // Update game with metadata
    await supabase
      .from("games")
      .update({
        genres: metadata.genres,
        categories: metadata.categories,
        description: metadata.description,
        release_date: metadata.release_date,
        metacritic: metadata.metacritic,
        header_image: metadata.header_image,
        metadata_synced: true,
      })
      .eq("user_id", user.id)
      .eq("app_id", appId);

    return NextResponse.json({ success: true, metadata });
  } else {
    // Mark as synced even if no data (game might be removed from store)
    await supabase
      .from("games")
      .update({ metadata_synced: true })
      .eq("user_id", user.id)
      .eq("app_id", appId);

    return NextResponse.json({ success: true, metadata: null });
  }
}
