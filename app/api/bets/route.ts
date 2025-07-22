import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  // Connect to supabase
  const supabase = await createClient();

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user not logged in and tries to access route
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get betting data and sort by completed and reverse chronological
  const { data: bets, error } = await supabase
    .from("bets")
    .select(
      `
    id,
    amount,
    potential_winnings,
    processed_amount_won,
    created_at,
    processed_at,
    live_game_id,
    kills,
    deaths,
    cs,
    assists,
    player:players (
      riot_id,
      tag,
      weighted_avg_kills,
      weighted_avg_deaths,
      weighted_avg_assists,
      weighted_avg_cs
    ),
    live_game:live_games (
      final_kills,
      final_deaths,
      final_assists,
      final_cs
    )
  `
    )
    .eq("user_id", user.id)
    .order("processed_at", { ascending: false })
    .order("created_at", { ascending: false });

  // Error querying from database
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // Return betting data
  return NextResponse.json({ bets }, { status: 200 });
}
