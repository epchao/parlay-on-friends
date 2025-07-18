import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    // Extract request parameters
    const { user_id, player_id, selections, amount } = await request.json();
    // Check all fields were specified
    if (!user_id || !player_id || !selections || !amount) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to DB
    const supabase = await createClient();

    // Get balance
    const { data: balanceData, error: balanceError } = await supabase
      .from("users")
      .select("account_balance")
      .eq("user_id", user_id)
      .single();

    // Check if error happened while getting balance
    if (balanceError || !balanceData) {
      return Response.json({ error: "Failed to place bet" }, { status: 500 });
    }

    // Validate Balance
    if (amount > balanceData.account_balance) {
      return Response.json({ error: "Not enough funds" }, { status: 400 });
    }

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

    const multiplier = selections.length + 1;

    // Insert
    const { error } = await supabase
      .from("bets")
      .insert({ 
        user_id, 
        player_id, 
        selections, 
        amount, 
        multiplier, 
        live_game_id: liveGame.id 
      });

    // Check if error happened while inserting
    if (error) {
      console.error(error);
      return Response.json({ error: "Failed to place bet" }, { status: 500 });
    }

    const { data: updateData, error: updateError } = await supabase
      .from("users")
      .update({ account_balance: balanceData.account_balance - amount })
      .eq("user_id", user_id)
      .select()
      .single();
    if (updateError) {
      console.log(updateError);
      return Response.json(
        { error: "Failed to update balance" },
        { status: 500 }
      );
    }
    const newBalance = updateData?.account_balance;

    return Response.json({
      user_id,
      player_id,
      selections,
      amount,
      multiplier,
      live_game_id: liveGame.id,
      newBalance,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
