import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGameDetails, extractGameMetadata, getSteamReviewData } from "@/lib/steam/store-api";
import { getMainStoryHours } from "@/lib/hltb/api";

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
    const isGame = metadata.type === 'game';

    // Only fetch HLTB and Steam reviews for actual games
    const [mainStoryHours, steamReviewData] = isGame
      ? await Promise.all([
          details?.data?.name ? getMainStoryHours(details.data.name) : null,
          getSteamReviewData(appId),
        ])
      : [null, null];

    // Calculate weighted score using Bayesian average
    // Formula: (count / (count + m)) * score + (m / (count + m)) * average
    // Where m = 100 (threshold) and average = 70 (assumed average score)
    const weightedScore = steamReviewData
      ? Math.round(
          (steamReviewData.count / (steamReviewData.count + 100)) * steamReviewData.score +
          (100 / (steamReviewData.count + 100)) * 70
        )
      : null;

    // Update game with metadata
    await supabase
      .from("games")
      .update({
        type: metadata.type,
        genres: metadata.genres,
        categories: metadata.categories,
        description: metadata.description,
        release_date: metadata.release_date,
        steam_review_score: steamReviewData?.score ?? null,
        steam_review_count: steamReviewData?.count ?? null,
        steam_review_weighted: weightedScore,
        header_image: metadata.header_image,
        main_story_hours: mainStoryHours,
        metadata_synced: true,
      })
      .eq("user_id", user.id)
      .eq("app_id", appId);

    return NextResponse.json({
      success: true,
      metadata: {
        ...metadata,
        main_story_hours: mainStoryHours,
        steam_review_score: steamReviewData?.score ?? null,
        steam_review_count: steamReviewData?.count ?? null,
        steam_review_weighted: weightedScore,
      }
    });
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
