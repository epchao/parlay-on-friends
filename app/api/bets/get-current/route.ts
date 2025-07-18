import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const { user_id, player_id } = await request.json();

    if (!user_id || !player_id) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get the current live game for this player
    const { data: liveGame, error: liveGameError } = await supabase
      .from('live_games')
      .select('id')
      .eq('player_id', player_id)
      .eq('status', 'in_progress')
      .single();

    if (liveGameError || !liveGame) {
      // No active game, return empty bet
      return Response.json({
        kills: 'NONE',
        deaths: 'NONE',
        cs: 'NONE',
        assists: 'NONE'
      });
    }

    // Get existing bet for this user/player/game
    const { data: existingBet, error: betError } = await supabase
      .from("bets")
      .select("kills, deaths, cs, assists, amount, multiplier, potential_winnings")
      .eq("user_id", user_id)
      .eq("player_id", player_id)
      .eq("live_game_id", liveGame.id)
      .single();

    if (betError || !existingBet) {
      // No existing bet, return empty selections
      return Response.json({
        kills: 'NONE',
        deaths: 'NONE',
        cs: 'NONE',
        assists: 'NONE'
      });
    }

    // Return existing bet selections
    return Response.json({
      kills: existingBet.kills || 'NONE',
      deaths: existingBet.deaths || 'NONE',
      cs: existingBet.cs || 'NONE',
      assists: existingBet.assists || 'NONE',
      amount: existingBet.amount,
      multiplier: existingBet.multiplier,
      potential_winnings: existingBet.potential_winnings
    });

  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
