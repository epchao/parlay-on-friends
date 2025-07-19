import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    // Extract request parameters
    const { user_id, player_id, live_game_id, amount, kills, deaths, cs, assists } = await request.json();
    // Check all fields were specified
    if (!user_id || !player_id || !amount) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate that at least one selection is made
    const selections = [kills, deaths, cs, assists].filter(selection => selection && selection !== 'NONE');
    if (selections.length === 0) {
      return Response.json(
        { error: "At least one bet selection is required" }, 
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

    const game_id = live_game_id || liveGame.id;
    const multiplier = selections.length + 1;
    const potential_winnings = amount * multiplier;

    // Check if this is an update (existing bet) or a new bet
    const { data: existingBet, error: existingBetError } = await supabase
      .from("bets")
      .select("amount")
      .eq("user_id", user_id)
      .eq("player_id", player_id)
      .eq("live_game_id", game_id)
      .single();

    const isUpdate = existingBet && !existingBetError;
    const previousAmount = existingBet?.amount || 0;

    // Validate Balance for new bets or amount increases
    if (!isUpdate) {
      // New bet - check full amount
      if (amount > balanceData.account_balance) {
        return Response.json({ error: "Not enough funds" }, { status: 400 });
      }
    } else if (amount > previousAmount) {
      // Update with higher amount - check the difference
      const amountDifference = amount - previousAmount;
      if (amountDifference > balanceData.account_balance) {
        return Response.json({ error: "Not enough funds for the increased bet amount" }, { status: 400 });
      }
    }

    // Use upsert to update existing bet or insert new one
    const { error } = await supabase
      .from("bets")
      .upsert({
        user_id,
        player_id,
        live_game_id: game_id,
        amount,
        kills: kills || 'NONE',
        deaths: deaths || 'NONE', 
        cs: cs || 'NONE',
        assists: assists || 'NONE',
        multiplier,
        potential_winnings,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,player_id,live_game_id'
      });

    // Check if error happened while inserting
    if (error) {
      console.error(error);
      return Response.json({ error: "Failed to place bet" }, { status: 500 });
    }

    // Only update balance if it's a new bet or the amount changed
    let newBalance = balanceData.account_balance;
    if (!isUpdate) {
      // New bet - deduct full amount
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
      newBalance = updateData?.account_balance;
    } else if (amount !== previousAmount) {
      // Update with different amount - adjust the difference
      const amountDifference = amount - previousAmount;
      const { data: updateData, error: updateError } = await supabase
        .from("users")
        .update({ account_balance: balanceData.account_balance - amountDifference })
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
      newBalance = updateData?.account_balance;
    }
    // If it's an update with the same amount, don't change balance

    return Response.json({
      user_id,
      player_id,
      kills: kills || 'NONE',
      deaths: deaths || 'NONE',
      cs: cs || 'NONE', 
      assists: assists || 'NONE',
      amount,
      multiplier,
      potential_winnings,
      live_game_id: game_id,
      newBalance,
      isUpdate,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
