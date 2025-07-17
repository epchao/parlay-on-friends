import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { LolApi, Constants } from "twisted";

const lolApi = new LolApi({ key: process.env.RIOT_KEY_SECRET });

export async function GET(request: Request) {
  const startTime = new Date();
  console.log(`🔄 CRON JOB STARTED at ${startTime.toISOString()}`);
  
  // Secure the endpoint
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.log('❌ CRON JOB: Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();

  try {
    // Get all players with active live games OR games waiting for match data
    const { data: liveGames, error: liveGamesError } = await supabase
      .from('live_games')
      .select('*')
      .in('status', ['in_progress', 'ended']);

    if (liveGamesError) {
      console.error('Error fetching live games:', liveGamesError);
      return NextResponse.json({ error: 'Failed to fetch live games' }, { status: 500 });
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
          const matchResponse = await lolApi.MatchV5.get(
            liveGame.id, // Use the full match ID directly
            Constants.RegionGroups.AMERICAS
          );

          const participant = matchResponse.response.info.participants.find(
            p => p.puuid === liveGame.player_id
          );

          if (participant) {
            // Process the completed game (same logic as below)
            await processCompletedGame(liveGame, participant, matchResponse, supabase);
            completedGames++;
          }
        } catch (retryError: any) {
          if (retryError.status === 404) {
            console.log(`Match data still not available for ${liveGame.id}. Will retry again.`);
          } else {
            console.error(`Error retrying match data for ${liveGame.id}:`, retryError);
          }
        }
        continue;
      }
      
      // For in_progress games, check if still active
      try {
        // Check if the game is still active
        await lolApi.SpectatorV5.activeGame(
          liveGame.player_id,
          Constants.Regions.AMERICA_NORTH
        );

        // If we get here, the game is still active
        console.log(`Game ${liveGame.id} is still active`);

      } catch (error: any) {
        // If 404, the game has ended
        if (error.status === 404) {
          completedGames++;
          console.log(`Game ${liveGame.id} has ended. Processing...`);

          // Fetch the match result
          try {
            const matchResponse = await lolApi.MatchV5.get(
              liveGame.id,
              Constants.RegionGroups.AMERICAS
            );

            const participant = matchResponse.response.info.participants.find(
              p => p.puuid === liveGame.player_id
            );

            if (participant) {
              // Update the live game with final stats and process bets
              const { error: updateError } = await supabase
                .from('live_games')
                .update({
                  status: 'completed',
                  game_end_time: matchResponse.response.info.gameEndTimestamp,
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
              await processCompletedGame(liveGame, participant, matchResponse, supabase);

              console.log(`Successfully processed game ${liveGame.id}`);
            }
          } catch (matchError: any) {
            // If match data not available yet (common after game ends), mark for retry
            if (matchError.status === 404) {
              console.log(`Match data not yet available for ${liveGame.id}. Will retry on next cron run.`);
              
              // Update the live game status to "ended" but not "completed" so we retry later
              await supabase
                .from('live_games')
                .update({
                  status: 'ended', // New intermediate status
                  game_end_time: new Date().toISOString()
                })
                .eq('id', liveGame.id);
            } else {
              console.error(`Error fetching match data for ${liveGame.id}:`, matchError);
            }
          }
        } else {
          console.error(`Error checking game ${liveGame.id}:`, error);
        }
      }
    }

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    
    console.log(`✅ CRON JOB COMPLETED at ${endTime.toISOString()}`);
    console.log(`📊 SUMMARY: ${processedGames} games checked, ${completedGames} completed, ${duration}ms duration`);

    return NextResponse.json({ 
      message: `Processed ${liveGames.length} games`,
      processedGames,
      completedGames,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ CRON JOB ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
        const { error: balanceError } = await supabase.rpc('increment_user_balance', {
          user_uuid: bet.user_id,
          amount: winnings
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
          ? selections.reduce((count, sel) => count + Object.keys(sel).length, 0)
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
