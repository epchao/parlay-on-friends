import { createClient } from "@/utils/supabase/server";

export async function DELETE(request: Request) {
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
      .select('id, game_start_time')
      .eq('player_id', player_id)
      .eq('status', 'in_progress')
      .single();

    if (liveGameError || !liveGame) {
      return Response.json({ error: "Player not currently in a live game" }, { status: 400 });
    }

    // Check if more than 5 minutes have passed since game start
    const gameStartTime = new Date(liveGame.game_start_time);
    const currentTime = new Date();
    const gameTimeElapsedMs = currentTime.getTime() - gameStartTime.getTime();
    const fiveMinutesInMs = 5 * 60 * 1000; // 5 minutes in milliseconds

    if (gameTimeElapsedMs > fiveMinutesInMs) {
      const minutesElapsed = Math.floor(gameTimeElapsedMs / (60 * 1000));
      return Response.json({ 
        error: `Betting is closed. Game has been in progress for ${minutesElapsed} minutes (betting closes after 5 minutes)` 
      }, { status: 400 });
    }

    // Delete the bet
    const { error: deleteError } = await supabase
      .from("bets")
      .delete()
      .eq("user_id", user_id)
      .eq("player_id", player_id)
      .eq("live_game_id", liveGame.id);

    if (deleteError) {
      console.error(deleteError);
      return Response.json({ error: "Failed to delete bet" }, { status: 500 });
    }

    return Response.json({ message: "Bet deleted successfully" });

  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
