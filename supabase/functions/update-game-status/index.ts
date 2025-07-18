import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const startTime = new Date();
    console.log(`🔄 SUPABASE CRON JOB STARTED at ${startTime.toISOString()}`);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Get Riot API key
    const riotApiKey = Deno.env.get('RIOT_KEY_SECRET')!

    // Get all active live games
    const { data: liveGames, error: liveGamesError } = await supabase
      .from('live_games')
      .select('*')
      .in('status', ['in_progress', 'ended']);

    if (liveGamesError) {
      console.error('Error fetching live games:', liveGamesError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch live games' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Checking ${liveGames.length} live games...`);

    let processedGames = 0;
    let completedGames = 0;

    for (const liveGame of liveGames) {
      processedGames++;
      
      // If game is already marked as ended, try to get match data
      if (liveGame.status === 'ended') {
        console.log(`Retrying match data for ended game ${liveGame.id}...`);
        try {
          const matchResponse = await fetch(
            `https://americas.api.riotgames.com/lol/match/v5/matches/${liveGame.id}?api_key=${riotApiKey}`
          );

          if (matchResponse.ok) {
            const matchData = await matchResponse.json();
            const participant = matchData.info.participants.find(
              (p: any) => p.puuid === liveGame.player_id
            );

            if (participant) {
              await processCompletedGame(liveGame, participant, matchData, supabase);
              completedGames++;
            }
          }
        } catch (retryError: any) {
          console.log(`Match data still not available for ${liveGame.id}. Will retry again.`);
        }
        continue;
      }
      
      // For in_progress games, check if still active
      try {
        const activeGameResponse = await fetch(
          `https://na1.api.riotgames.com/lol/spectator/v5/active-games/by-puuid/${liveGame.player_id}?api_key=${riotApiKey}`
        );

        if (activeGameResponse.ok) {
          // Game is still active
          console.log(`Game ${liveGame.id} is still active`);
        } else if (activeGameResponse.status === 404) {
          // Game has ended
          completedGames++;
          console.log(`Game ${liveGame.id} has ended. Processing...`);

          // Fetch the match result
          try {
            const matchResponse = await fetch(
              `https://americas.api.riotgames.com/lol/match/v5/matches/${liveGame.id}?api_key=${riotApiKey}`
            );

            if (matchResponse.ok) {
              const matchData = await matchResponse.json();
              const participant = matchData.info.participants.find(
                (p: any) => p.puuid === liveGame.player_id
              );

              if (participant) {
                // Update the live game with final stats
                const { error: updateError } = await supabase
                  .from('live_games')
                  .update({
                    status: 'completed',
                    game_end_time: matchData.info.gameEndTimestamp,
                    final_kills: participant.kills,
                    final_deaths: participant.deaths,
                    final_assists: participant.assists,
                    final_cs: participant.totalMinionsKilled + participant.neutralMinionsKilled
                  })
                  .eq('id', liveGame.id);

                if (updateError) {
                  console.error('Error updating live game:', updateError);
                  continue;
                }

                // Process bets for this game
                await processCompletedGame(liveGame, participant, matchData, supabase);
                console.log(`Successfully processed game ${liveGame.id}`);
              }
            } else {
              // Match data not available yet
              console.log(`Match data not yet available for ${liveGame.id}. Will retry on next cron run.`);
              
              await supabase
                .from('live_games')
                .update({
                  status: 'ended',
                  game_end_time: new Date().toISOString()
                })
                .eq('id', liveGame.id);
            }
          } catch (matchError: any) {
            console.error(`Error fetching match data for ${liveGame.id}:`, matchError);
          }
        }
      } catch (error: any) {
        console.error(`Error checking game ${liveGame.id}:`, error);
      }
    }

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    
    console.log(`✅ SUPABASE CRON JOB COMPLETED at ${endTime.toISOString()}`);
    console.log(`📊 SUMMARY: ${processedGames} games checked, ${completedGames} completed, ${duration}ms duration`);

    return new Response(
      JSON.stringify({ 
        message: `Processed ${liveGames.length} games`,
        processedGames,
        completedGames,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ SUPABASE CRON JOB ERROR:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function getStatValue(participant: any, statType: string): number {
  switch (statType) {
    case 'kills': return participant.kills;
    case 'deaths': return participant.deaths;
    case 'assists': return participant.assists;
    case 'cs': return participant.totalMinionsKilled + participant.neutralMinionsKilled;
    default: return 0;
  }
}

// Helper function to get player weighted average from stored values
async function getPlayerWeightedAverage(playerId: string, statType: string, supabase: any): Promise<number> {
  const { data: player, error } = await supabase
    .from('players')
    .select(`weighted_avg_${statType}`)
    .eq('id', playerId)
    .single();

  if (error) {
    console.error('Error getting stored weighted average:', error);
    return 0;
  }

  return player?.[`weighted_avg_${statType}`] || 0;
}

// Helper function to process a completed game
async function processCompletedGame(liveGame: any, participant: any, matchResponse: any, supabase: any) {
  console.log(`Processing completed game ${liveGame.id}...`);
  
  // Process bets for this game
  const { data: bets, error: betsError } = await supabase
    .from('bets')
    .select('*')
    .eq('live_game_id', liveGame.id)
    .is('processed_at', null);

  if (!betsError && bets && bets.length > 0) {
    console.log(`Processing ${bets.length} bets for game ${liveGame.id}`);

    for (const bet of bets) {
      let winnings = 0;
      const selections = bet.selections as any;
      console.log('Bet selections:', selections);

      // Process each selection in the bet
      let allCorrect = true;
      
      // Handle both array format [{ kills: 'LESS' }] and object format { kills: 'higher' }
      const selectionsToProcess = Array.isArray(selections) ? selections : [selections];
      
      for (const selectionObj of selectionsToProcess) {
        for (const [statType, prediction] of Object.entries(selectionObj)) {
          console.log(`Processing statType: "${statType}", prediction: "${prediction}"`);
          const actualValue = getStatValue(participant, statType);
          const threshold = await getPlayerWeightedAverage(liveGame.player_id, statType, supabase);
          
          // Normalize prediction values (handle both 'LESS'/'MORE' and 'lower'/'higher')
          const predictionStr = String(prediction).toLowerCase();
          const normalizedPrediction = predictionStr === 'less' ? 'lower' : 
                                       predictionStr === 'more' ? 'higher' : 
                                       predictionStr;
          
          const isCorrect = (normalizedPrediction === 'higher' && actualValue > threshold) ||
                           (normalizedPrediction === 'lower' && actualValue < threshold);
          
          if (!isCorrect) {
            allCorrect = false;
            break;
          }
        }
        if (!allCorrect) break;
      }

      if (allCorrect) {
        winnings = Number(bet.amount) * Number(bet.multiplier);
        
        // Update user balance
        const { error: balanceError } = await supabase.rpc('increment_balance', {
          p_user_id: bet.user_id,
          p_amount: winnings
        });

        if (balanceError) {
          console.error('Error updating user balance:', balanceError);
        }

        // Insert notification for winning bet
        // Get player name for notification
        const { data: playerData } = await supabase
          .from('players')
          .select('riot_id, tag')
          .eq('id', liveGame.player_id)
          .single();

        const playerName = playerData?.riot_id + '#' + playerData?.tag || 'Unknown Player';

        // Count total selections properly
        const totalSelections = Array.isArray(selections) 
          ? selections.reduce((count: number, sel: any) => count + Object.keys(sel).length, 0)
          : Object.keys(selections).length;

        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: bet.user_id,
            type: 'bet_won',
            title: 'Parlay Won! 🎉',
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
          console.error('Error inserting notification:', notificationError);
        }
      }

      // Mark bet as processed
      await supabase
        .from('bets')
        .update({ processed_at: new Date().toISOString() })
        .eq('id', bet.id);
    }
  }
}
