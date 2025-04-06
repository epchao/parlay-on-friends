import { RiotApi, LolApi, Constants } from "twisted";
import { Player } from "../../../interfaces/player";
import { promiseHooks } from "v8";
import { constants } from "buffer";
import { createClient } from '@/utils/supabase/server';

/*

load raw stats into supabase for the player (to avoid rate limit)
then filter by player id and then calculate averages

match_id foreign key

put active player (like a streamer) intead of me to see cards and stuff

.insert to put shit into supabase
*/
const sleep = (ms:number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const riotApi = new RiotApi({ key: process.env.RIOT_KEY_SECRET });
const lolApi = new LolApi({ key: process.env.RIOT_KEY_SECRET });

export async function MatchHistoryStats(riotId: string, tag: string){

  try{
    sleep(1000);
    const account = await riotApi.Account.getByRiotId(
      riotId as string,
      tag as string,
      Constants.RegionGroups.AMERICAS
    );
    if (!account.response.puuid) {
      return { error: "Player not found", status: 404 };
    }

    
    const puuid = account.response.puuid;
    
    const rankedMatch = [420];   // Solo/Duo and 440 for Flex
    let matchIds: string[] = [];

    sleep(1000);
    for (const queue of rankedMatch){
      const matches = await lolApi.MatchV5.list(puuid, Constants.RegionGroups.AMERICAS, {count: 5, queue});  // Takes last 15 matches
      matchIds.push(...matches.response);
    }
    sleep(1000);

    const matchStats = await Promise.all(   // Waits till all processes are done
      matchIds.map(async (matchId) => {
          const matchData = await lolApi.MatchV5.get(matchId, Constants.RegionGroups.AMERICAS);
          sleep(100);
          const participants = matchData.response.info.participants;

          // Find the participant corresponding to the given PUUID
          const playerStats = participants.find((p) => p.puuid === puuid);

          let kills;  // Get the kills count
          if (playerStats){
              kills = playerStats.kills;
          }else {
              kills = null;
          }

          let assists;  // Get the assists count
          if (playerStats){
              assists = playerStats.assists;
          }else {
            assists = null;
          }

          let deaths;  // Get the death count
          if (playerStats){
            deaths = playerStats.deaths;
          }else {
            deaths = null;
          }
          
          let cs;  // Get the cs count
          if (playerStats){
            cs = playerStats.totalMinionsKilled + playerStats.neutralMinionsKilled;
          }else {
            cs = null;
          }

          let team_position;
          if (playerStats){
            team_position = playerStats.teamPosition;
          }

          return {
              matchId, kills, deaths, assists, cs, team_position
          };
      })
  );


    const numGames = matchStats.length;
    
    let totalKills = 0;
    let totalDeaths = 0;
    let totalAssists = 0;
    let totalCS = 0;

    for (const game of matchStats){
      if (game.kills !== null) totalKills += game.kills;
      if (game.deaths !== null) totalDeaths += game.deaths;
      if (game.assists !== null) totalAssists += game.assists;
      if (game.cs !== null) totalCS += game.cs;
    }

    const averageKills = parseFloat((totalKills / numGames).toFixed(1));
    const averageDeaths = parseFloat((totalDeaths / numGames).toFixed(1));
    const averageAssists = parseFloat((totalAssists / numGames).toFixed(1));
    const averageCs = parseFloat((totalCS / numGames).toFixed(1));

    console.log("Searching for player with Riot ID:", riotId, "and Tag:", tag);

    // Inserting data into database
    const supabase = await createClient();

    // notes for what to do for player_id
    // filter all the rows by player id and match id
    // sort by match id
    // do revsere sorting (highest match id)
    // check if you find a match id terminate the ENTIRE search (since its already in our database)
    // since we know its gonna be the same 
    // 

    
    // Step 1: Fetch the player ID by matching riot_id and tag
    const { data: matchingPlayer, error: playerError } = await supabase
    .from('players')
    .select('id')
    .eq('riot_id', riotId)
    .eq('tag', tag)
    .single(); // throw error if not found

    if (playerError) {
    console.error("Error querying player:", playerError);
    return;
    }

    if (!matchingPlayer) {
    console.error("No player found with that riot_id and tag.");
    return;
    }

    const playerId = matchingPlayer.id;
    console.log("player PLEASE WORK", playerId)

      
    const formattedStats = matchStats.map(match => ({
      match_id: match.matchId,
      kills: match.kills,
      deaths: match.deaths,
      assists: match.assists,
      cs: match.cs,
      team_position: match.team_position,
      player_id: playerId
    }));

    // This is to input into the database but commented out during testing

    // const { data, error } = await supabase
    //   .from('match_history')
    //   .insert(formattedStats)
    //   .select();

    //   if (error) {
    //     console.error("Error inserting match stats:", error);
    //   } else {
    //     console.log("Match stats inserted successfully:", data);
    //   }

    return {

      // remove all this average stuff
      // instead will be using data from our database to calculate averages
      averageKills, averageDeaths, averageAssists, averageCs
    };

} catch (error) {
  console.error("Error fetching match history:", error);
  
}
}