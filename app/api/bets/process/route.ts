import { createClient } from "@/utils/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { LolApi, Constants } from "twisted";

const lolApi = new LolApi({ key: process.env.RIOT_KEY_SECRET });

interface Bet {
  id: string;
  user_id: string;
  player_id: string;
  selections: any[];
  amount: number;
  multiplier: number;
  processed_at: string | null;
}

interface MatchResult {
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
}

export async function POST(request: Request) {
  try {
    const { playerId, thresholds } = await request.json();

    if (!playerId) {
      return Response.json({ error: "Player ID required" }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Get the most recent match results for this player
    const matchResults = await getLatestMatchResults(playerId);

    if (!matchResults) {
      return Response.json({ error: "No recent match found" }, { status: 404 });
    }

    // 2. Get all active bets for this player
    const { data: bets, error: betsError } = await supabase
      .from("bets")
      .select("*")
      .eq("player_id", playerId)
      .is("processed_at", null); // Only unprocessed bets

    if (betsError) {
      return Response.json({ error: "Failed to fetch bets" }, { status: 500 });
    }

    if (!bets || bets.length === 0) {
      return Response.json({ message: "No active bets found" });
    }

    // 3. Process each bet with dynamic thresholds
    const winningBets = [];

    for (const bet of bets) {
      const result = await processBet(bet, matchResults, supabase, thresholds);
      if (result.won) {
        winningBets.push(result);
      }
    }

    // 4. Create notifications for winning bets
    if (winningBets.length > 0) {
      await createNotifications(winningBets, supabase);
    }

    return Response.json({
      message: "Bets processed successfully",
      totalBets: bets.length,
      winningBets: winningBets.length,
      winners: winningBets,
    });
  } catch (error) {
    console.error("Error processing bets:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function getLatestMatchResults(
  playerId: string
): Promise<MatchResult | null> {
  try {
    // Get the most recent match
    const matches = await lolApi.MatchV5.list(
      playerId,
      Constants.RegionGroups.AMERICAS,
      { count: 1 }
    );

    if (!matches.response || matches.response.length === 0) {
      console.log("No recent matches found for player:", playerId);
      return null;
    }

    const matchId = matches.response[0];

    const match = await lolApi.MatchV5.get(
      matchId,
      Constants.RegionGroups.AMERICAS
    );

    // Find the player's stats in the match
    const participant = match.response.info.participants.find(
      (p: any) => p.puuid === playerId
    );

    if (!participant) {
      console.log("Player not found in match data");
      return null;
    }

    return {
      kills: participant.kills,
      deaths: participant.deaths,
      assists: participant.assists,
      cs: participant.totalMinionsKilled + participant.neutralMinionsKilled,
    };
  } catch (error) {
    console.error("Error fetching match results:", error);
    return null;
  }
}

async function processBet(
  bet: Bet,
  matchResults: MatchResult,
  supabase: SupabaseClient,
  thresholds: {
    kills: number;
    deaths: number;
    assists: number;
    cs: number;
  }
) {
  let allCorrect = true;
  const results = [];

  // Check each selection in the bet
  for (const selection of bet.selections) {
    const [statType, prediction] = Object.entries(selection)[0] as [
      string,
      "MORE" | "LESS",
    ];
    const actualValue = matchResults[statType as keyof MatchResult];
    const threshold = thresholds[statType as keyof typeof thresholds];

    if (actualValue === undefined || threshold === undefined) {
      console.error(`Invalid stat type: ${statType}`);
      allCorrect = false;
      continue;
    }

    const wasCorrect =
      (prediction === "MORE" && actualValue > threshold) ||
      (prediction === "LESS" && actualValue < threshold);

    results.push({
      stat: statType,
      prediction,
      actual: actualValue,
      threshold,
      correct: wasCorrect,
    });

    if (!wasCorrect) {
      allCorrect = false;
    }
  }

  let winnings = 0;

  if (allCorrect) {
    winnings = bet.amount * bet.multiplier;

    // Update user balance
    const { error: balanceError } = await supabase.rpc(
      "increment_balance",
      {
        p_user_id: bet.user_id,
        p_amount: winnings,
      }
    );

    if (balanceError) {
      console.error("Error updating balance:", balanceError);
    }
  } else {
    console.log("Bet lost");
  }

  // Mark bet as processed
  const { error: updateError } = await supabase
    .from("bets")
    .update({
      processed_at: new Date().toISOString(),
    })
    .eq("id", bet.id);

  if (updateError) {
    console.error("Error updating bet:", updateError);
  } else {
    console.log("Bet processed:", bet.id);
  }

  return {
    bet,
    won: allCorrect,
    winnings,
    results,
    matchResults,
  };
}

async function createNotifications(winningBets: any[], supabase: any) {
  const notifications = winningBets.map((result) => ({
    user_id: result.bet.user_id,
    type: "bet_won",
    title: "Bet Won! 🎉",
    message: `You won $${result.winnings} on your parlay bet!`,
    data: {
      betId: result.bet.id,
      winnings: result.winnings,
      selections: result.bet.selections,
      results: result.results,
    },
  }));

  const { error } = await supabase.from("notifications").insert(notifications);
  if (error) {
    console.error("Error creating notifications:", error);
  } else {
    console.log(`Created ${notifications.length} notifications`);
  }
}
