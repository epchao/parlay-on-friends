import { RiotApi, LolApi, Constants } from "twisted";
import { Player } from "../../../interfaces/player";
import { promiseHooks } from "v8";
import { constants } from "buffer";
import { createClient } from '@/utils/supabase/server';

/*
gamemode: CLASSIC
verify matches are from ranked (solo/duo and flex)
get past 20 matchIDs
calculate (use eugenes function in docs)

*/
const sleep = (ms:number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const riotApi = new RiotApi({ key: process.env.RIOT_KEY_SECRET });
const lolApi = new LolApi({ key: process.env.RIOT_KEY_SECRET });

export async function MatchHistoryStats(riotId: string, tag: string){

  const supabase = await createClient(); 
  const { data: players } = await supabase.from("players").select('*');
  console.log(JSON.stringify(players, null, 2));

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
      const matches = await lolApi.MatchV5.list(puuid, Constants.RegionGroups.AMERICAS, {count: 5, queue});  // Takes last 20 matches
      matchIds.push(...matches.response);
    }
    sleep(1000);

    const matchKills = await Promise.all(   // Waits till all processes are done
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

          let teamPosition;
          if (playerStats){
            teamPosition = playerStats.teamPosition;
          }

          return {
              matchId, kills, deaths, assists, cs, teamPosition, players
          };
      })
  );

  return matchKills;
} catch (error) {
  console.error("Error fetching match history:", error);
  
}
}