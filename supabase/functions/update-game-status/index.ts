/// <reference path="./types.d.ts" />
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    const startTime = new Date();
    console.log(`🔄 SUPABASE CRON JOB STARTED at ${startTime.toISOString()}`);
    // Create Supabase client with service role key for admin privileges
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    // Initialize bet processing statistics
    let totalBetsProcessed = 0;
    let totalWinningBets = 0;
    let totalLosingBets = 0;
    let totalWinningsAmount = 0;
    let totalLossesAmount = 0;
    // Get Riot API key
    const riotApiKey = Deno.env.get("RIOT_KEY_SECRET")!;
    console.log(`Using Riot API key: ${riotApiKey ? "PRESENT" : "MISSING"} (length: ${riotApiKey?.length || 0})`);
    // Test API key validity first
    try {
      const testResponse = await fetch(`https://na1.api.riotgames.com/lol/status/v4/platform-data?api_key=${riotApiKey}`);
      console.log(`API key test response: ${testResponse.status}`);
      if (!testResponse.ok) {
        console.error(`API key test failed: ${testResponse.status} ${testResponse.statusText}`);
        return new Response(JSON.stringify({
          error: `Riot API authentication failed: ${testResponse.status}`
        }), {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
      }
    } catch (testError) {
      console.error("API key test error:", testError);
    }
    // Get all players with active live games
    const { data: liveGames, error: liveGamesError } = await supabase.from("live_games").select("*").eq("status", "in_progress");
    if (liveGamesError) {
      console.error("Error fetching live games:", liveGamesError);
      return new Response(JSON.stringify({
        error: "Failed to fetch live games"
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    console.log(`Checking ${liveGames.length} live games...`);
    
    // Debug: Check what bets exist in the system
    const { data: allBetsInSystem, error: allBetsError } = await supabase.from("bets").select("id, live_game_id, processed_at").limit(20);
    console.log(`🔍 TOTAL BETS IN SYSTEM: ${allBetsInSystem?.length || 0}`);
    if (allBetsInSystem && allBetsInSystem.length > 0) {
      console.log("📋 Sample bets:");
      allBetsInSystem.forEach((bet: any) => {
        console.log(`   Bet ${bet.id}: game=${bet.live_game_id}, processed=${bet.processed_at ? 'YES' : 'NO'}`);
      });
    }
    
    let processedGames = 0;
    let completedGames = 0;
    for (const liveGame of liveGames){
      processedGames++;
      console.log(`🎮 Processing game ${processedGames}/${liveGames.length}: ${liveGame.id} (status: ${liveGame.status})`);
      
      // For in_progress games, check if still active
      try {
        // Check if the game is still active on NA1
        console.log(`Checking if game ${liveGame.id} is still active...`);
        const activeGameResponse = await fetch(`https://na1.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${liveGame.player_id}?api_key=${riotApiKey}`);
        console.log(`Active game API response status: ${activeGameResponse.status}`);
        if (activeGameResponse.ok) {
          // If we get here, the game is still active
          console.log(`Game ${liveGame.id} is still active`);
        } else if (activeGameResponse.status === 404) {
          // If 404, the game has ended
          console.log(`Game ${liveGame.id} has ended. Processing...`);
        } else if (activeGameResponse.status === 403) {
          // 403 usually means the game has ended and we can't check spectator data anymore
          console.log(`Game ${liveGame.id} spectator data unavailable (403) - assuming game has ended`);
        // Treat as if the game ended
        } else {
          console.error(`Unexpected API response for game ${liveGame.id}: ${activeGameResponse.status}`);
          continue;
        }
        // Process if game has ended (404) or spectator data unavailable (403)
        if (activeGameResponse.status === 404 || activeGameResponse.status === 403) {
          completedGames++;
          // Fetch the match result
          try {
            const matchResponse = await fetch(`https://americas.api.riotgames.com/lol/match/v5/matches/${liveGame.id}?api_key=${riotApiKey}`);
            if (matchResponse.ok) {
              const matchData = await matchResponse.json();
              const participant = matchData.info.participants.find((p: any) => p.puuid === liveGame.player_id);
              if (participant) {
                // Update the live game with final stats and process bets
                const { error: updateError } = await supabase.from("live_games").update({
                  status: "completed",
                  game_end_time: matchData.info.gameEndTimestamp,
                  final_kills: participant.kills,
                  final_deaths: participant.deaths,
                  final_assists: participant.assists,
                  final_cs: participant.totalMinionsKilled + participant.neutralMinionsKilled
                }).eq("id", liveGame.id);
                if (updateError) {
                  console.error("Error updating live game:", updateError);
                  continue;
                }
                // Process bets for this game
                console.log(`🎯 About to process bets for completed game ${liveGame.id}`);
                const betStats = await processCompletedGame(liveGame, participant, matchData, supabase);
                console.log(`📊 Bet processing results for ${liveGame.id}:`, betStats);
                totalBetsProcessed += betStats.betsProcessed;
                totalWinningBets += betStats.winningBets;
                totalLosingBets += betStats.losingBets;
                totalWinningsAmount += betStats.winningsAmount;
                totalLossesAmount += betStats.lossesAmount;
                console.log(`Successfully processed game ${liveGame.id}`);
              }
            } else {
              // If match data not available yet (common after game ends), skip for now
              console.log(`Match data not yet available for ${liveGame.id}. Will retry on next cron run.`);
            }
          } catch (matchError) {
            console.error(`Error fetching match data for ${liveGame.id}:`, matchError);
          }
        }
      } catch (error) {
        console.error(`Error checking game ${liveGame.id}:`, error);
      }
    }
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    console.log(`✅ SUPABASE CRON JOB COMPLETED at ${endTime.toISOString()}`);
    console.log(`📊 SUMMARY: ${processedGames} games checked, ${completedGames} completed, ${duration}ms duration`);
    console.log("\n📊 BET PROCESSING SUMMARY:");
    console.log(`Total bets processed: ${totalBetsProcessed}`);
    console.log(`Winning bets: ${totalWinningBets}`);
    console.log(`Losing bets: ${totalLosingBets}`);
    console.log(`Total winnings paid: $${totalWinningsAmount.toFixed(2)}`);
    console.log(`Total losses: $${totalLossesAmount.toFixed(2)}`);
    console.log(`Net payout: $${(totalWinningsAmount - totalLossesAmount).toFixed(2)}`);
    return new Response(JSON.stringify({
      message: `Processed ${liveGames.length} games`,
      processedGames,
      completedGames,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      betStats: {
        betsProcessed: totalBetsProcessed,
        winningBets: totalWinningBets,
        losingBets: totalLosingBets,
        totalWinnings: totalWinningsAmount,
        totalLosses: totalLossesAmount,
        netPayout: totalWinningsAmount - totalLossesAmount
      }
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("❌ SUPABASE CRON JOB ERROR:", error);
    return new Response(JSON.stringify({
      error: "Internal server error"
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
function getStatValue(participant: any, statType: string): number {
  switch(statType){
    case "kills":
      return participant.kills;
    case "deaths":
      return participant.deaths;
    case "assists":
      return participant.assists;
    case "cs":
      return participant.totalMinionsKilled + participant.neutralMinionsKilled;
    default:
      return 0;
  }
}
// Helper function to get player weighted average from stored values
async function getPlayerWeightedAverage(playerId: string, statType: string, supabase: any): Promise<number> {
  const { data: player, error } = await supabase.from("players").select(`weighted_avg_${statType}`).eq("id", playerId).single();
  if (error) {
    console.error("Error getting stored weighted average:", error);
    return 0;
  }
  return player?.[`weighted_avg_${statType}`] || 0;
}
// Helper function to process a completed game
async function processCompletedGame(liveGame: any, participant: any, matchResponse: any, supabase: any) {
  console.log(`Processing completed game ${liveGame.id}...`);
  
  // First, let's see ALL bets for this game (for debugging)
  const { data: allBets, error: allBetsError } = await supabase.from("bets").select("*").eq("live_game_id", liveGame.id);
  console.log(`🔍 ALL bets for game ${liveGame.id} (processed and unprocessed):`, allBets?.length || 0);
  if (allBets && allBets.length > 0) {
    allBets.forEach((bet: any) => {
      console.log(`   Bet ${bet.id}: processed_at=${bet.processed_at}, user=${bet.user_id}, amount=${bet.amount}`);
    });
  }
  
  // Initialize local statistics
  let betsProcessed = 0;
  let winningBets = 0;
  let losingBets = 0;
  let winningsAmount = 0;
  let lossesAmount = 0;
  // Process bets for this game
  const { data: bets, error: betsError } = await supabase.from("bets").select("*").eq("live_game_id", liveGame.id).is("processed_at", null);
  
  console.log(`🔍 Looking for unprocessed bets for game ${liveGame.id}`);
  console.log(`📊 Query result - Error: ${betsError ? JSON.stringify(betsError) : 'None'}, Bets found: ${bets?.length || 0}`);
  
  if (betsError) {
    console.error(`❌ Error fetching bets for game ${liveGame.id}:`, betsError);
    return {
      betsProcessed: 0,
      winningBets: 0,
      losingBets: 0,
      winningsAmount: 0,
      lossesAmount: 0
    };
  }

  if (!bets || bets.length === 0) {
    console.log(`ℹ️ No unprocessed bets found for game ${liveGame.id}`);
    return {
      betsProcessed: 0,
      winningBets: 0,
      losingBets: 0,
      winningsAmount: 0,
      lossesAmount: 0
    };
  }

  if (bets && bets.length > 0) {
    console.log(`Processing ${bets.length} bets for game ${liveGame.id}`);
    for (const bet of bets){
      betsProcessed++;
      let winnings = 0;
      const selections = bet.selections as any;
      console.log("Bet selections:", selections);

      // Check if selections exist and are valid
      if (!selections || (typeof selections !== 'object')) {
        console.error(`Invalid selections for bet ${bet.id}:`, selections);
        // Mark this bet as processed with error
        await supabase
          .from('bets')
          .update({ 
            processed_at: new Date().toISOString(),
            processed_amount_won: -Number(bet.amount) // Mark as loss due to invalid data
          })
          .eq('id', bet.id);
        
        losingBets++;
        lossesAmount += Number(bet.amount);
        continue;
      }

      // Process each selection in the bet
      let allCorrect = true;
      // Handle both array format [{ kills: 'LESS' }] and object format { kills: 'higher' }
      const selectionsToProcess = Array.isArray(selections) ? selections : [
        selections
      ];

      // Validate that we have selections to process
      if (selectionsToProcess.length === 0) {
        console.error(`No valid selections to process for bet ${bet.id}`);
        // Mark this bet as processed with error
        await supabase
          .from('bets')
          .update({ 
            processed_at: new Date().toISOString(),
            processed_amount_won: -Number(bet.amount) // Mark as loss due to no selections
          })
          .eq('id', bet.id);
        
        losingBets++;
        lossesAmount += Number(bet.amount);
        continue;
      }

      for (const selectionObj of selectionsToProcess){
        // Check if selectionObj is valid
        if (!selectionObj || typeof selectionObj !== 'object') {
          console.error(`Invalid selection object for bet ${bet.id}:`, selectionObj);
          allCorrect = false;
          break;
        }

        for (const [statType, prediction] of Object.entries(selectionObj)){
          console.log(`Processing statType: "${statType}", prediction: "${prediction}"`);
          
          // Validate statType and prediction
          if (!statType || !prediction || prediction === 'NONE') {
            console.log(`Skipping invalid or NONE selection: ${statType}=${prediction}`);
            continue;
          }
          
          const actualValue = getStatValue(participant, statType);
          const threshold = await getPlayerWeightedAverage(liveGame.player_id, statType, supabase);
          
          console.log(`${statType}: actual=${actualValue}, threshold=${threshold}, prediction=${prediction}`);
          
          // Normalize prediction values (handle both 'LESS'/'MORE' and 'lower'/'higher')
          const predictionStr = String(prediction).toLowerCase();
          const normalizedPrediction = predictionStr === "less" ? "lower" : predictionStr === "more" ? "higher" : predictionStr;
          const isCorrect = normalizedPrediction === "higher" && actualValue > threshold || normalizedPrediction === "lower" && actualValue < threshold;
          
          console.log(`${statType} prediction ${normalizedPrediction}: ${isCorrect ? 'CORRECT' : 'INCORRECT'}`);
          
          if (!isCorrect) {
            allCorrect = false;
            break;
          }
        }
        if (!allCorrect) break;
      }
      if (allCorrect) {
        winnings = Number(bet.amount) * Number(bet.multiplier);
        winningBets++;
        winningsAmount += winnings;
        console.log(`✅ Bet ${bet.id} WON: $${winnings.toFixed(2)} (${bet.multiplier}x multiplier on $${bet.amount})`);
        // Update user balance
        const { error: balanceError } = await supabase.rpc("increment_balance", {
          p_user_id: bet.user_id,
          p_amount: winnings
        });
        if (balanceError) {
          console.error("Error updating user balance:", balanceError);
        }
        // Insert notification for winning bet
        // Get player name for notification
        const { data: playerData } = await supabase.from("players").select("riot_id, tag").eq("id", liveGame.player_id).single();
        const playerName = playerData?.riot_id + "#" + playerData?.tag || "Unknown Player";
        // Count total selections properly
        const totalSelections = Array.isArray(selections) ? selections.reduce((count, sel)=>count + Object.keys(sel).length, 0) : Object.keys(selections).length;
        const { error: notificationError } = await supabase.from("notifications").insert({
          user_id: bet.user_id,
          type: "bet_won",
          title: "Parlay Won! 🎉",
          message: `Your ${totalSelections}-pick parlay on ${playerName} hit! You won $${winnings.toFixed(2)}`,
          data: {
            winnings: winnings,
            betAmount: bet.amount,
            multiplier: bet.multiplier,
            selections: selections,
            gameId: liveGame.id,
            playerName: playerName
          }
        });
        if (notificationError) {
          console.error("Error inserting notification:", notificationError);
        }
      } else {
        losingBets++;
        lossesAmount += Number(bet.amount);
        console.log(`❌ Bet ${bet.id} LOST: -$${bet.amount} (bet amount lost)`);
      }
      // Mark bet as processed with the amount won/lost
      const amountWon = allCorrect ? winnings : -Number(bet.amount); // Negative for losses
      console.log(`📝 Marking bet ${bet.id} as processed with amount: ${amountWon}`);
      
      // Add detailed logging for the update operation
      console.log(`🔧 Attempting to update bet ${bet.id} with:`);
      console.log(`   - processed_at: ${new Date().toISOString()}`);
      console.log(`   - processed_amount_won: ${amountWon}`);
      
      const { data: updateData, error: betUpdateError } = await supabase.from("bets").update({
        processed_at: new Date().toISOString(),
        processed_amount_won: amountWon
      }).eq("id", bet.id).select();
      
      if (betUpdateError) {
        console.error(`❌ Failed to update bet ${bet.id}:`, betUpdateError.message || betUpdateError);
        console.error(`❌ Full error object:`, JSON.stringify(betUpdateError, null, 2));
        if (betUpdateError.message?.includes("Row level security")) {
          console.error("🛑 RLS appears to be blocking this update.");
        }
      } else {
        console.log(`✅ Successfully updated bet ${bet.id}`);
        console.log(`📄 Updated data:`, updateData);
      }
    }
  }
  return {
    betsProcessed,
    winningBets,
    losingBets,
    winningsAmount,
    lossesAmount
  };
}
