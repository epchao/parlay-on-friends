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
      .select('id')
      .eq('player_id', player_id)
      .eq('status', 'in_progress')
      .single();

    if (liveGameError || !liveGame) {
      return Response.json({ error: "Player not currently in a live game" }, { status: 400 });
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
