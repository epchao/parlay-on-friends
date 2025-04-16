import { RiotApi, LolApi, Constants } from "twisted";
import { Player } from "../../../interfaces/player";
import { promiseHooks } from "v8";
import { constants } from "buffer";
import { createClient } from "@/utils/supabase/server";
import { currentPlayerAverages } from "./currentPlayerAverages";

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const riotApi = new RiotApi({ key: process.env.RIOT_KEY_SECRET });
const lolApi = new LolApi({ key: process.env.RIOT_KEY_SECRET });

export async function MatchHistoryStats(riotId: string, tag: string) {
  try {
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

    const rankedMatch = [420]; // Solo/Duo and 440 for Flex
    let matchIds: string[] = [];

    sleep(1000);
    for (const queue of rankedMatch) {
      const matches = await lolApi.MatchV5.list(
        puuid,
        Constants.RegionGroups.AMERICAS,
        { count: 5, queue }
      ); // Takes last 15 matches
      matchIds.push(...matches.response);
    }
    sleep(1000);

    const matchStats = await Promise.all(
      // Waits till all processes are done
      matchIds.map(async (matchId) => {
        const matchData = await lolApi.MatchV5.get(
          matchId,
          Constants.RegionGroups.AMERICAS
        );
        sleep(100);
        const participants = matchData.response.info.participants;

        // Find the participant corresponding to the given PUUID
        const playerStats = participants.find((p) => p.puuid === puuid);

        const kills = playerStats?.kills ?? null;
        const assists = playerStats?.assists ?? null;
        const deaths = playerStats?.deaths ?? null;
        const cs =
          (playerStats?.totalMinionsKilled ?? 0) +
          (playerStats?.neutralMinionsKilled ?? 0);
        const team_position = playerStats?.teamPosition ?? null;

        return {
          matchId,
          kills,
          deaths,
          assists,
          cs,
          team_position,
          participants, //for other player stats
        };
      })
    );

    // get the first match and extract the other 9 players
    const firstMatchData = await lolApi.MatchV5.get(
      matchIds[0],
      Constants.RegionGroups.AMERICAS
    );
    const firstParticipants = firstMatchData.response.info.participants;

    // exclude the target player's PUUID
    const otherPlayers = firstParticipants.filter((p) => p.puuid !== puuid);
    const otherPUUIDs = otherPlayers.map((p) => p.puuid);

    const otherPlayersAverages: Record<string, any> = {};

    for (const otherPuuid of otherPUUIDs) {
      const matchIdsForOther = await lolApi.MatchV5.list(
        otherPuuid,
        Constants.RegionGroups.AMERICAS,
        { count: 5, queue: 420 } // last 5 solo/duo games
      );

      const otherMatchStats = await Promise.all(
        matchIdsForOther.response.map(async (matchId) => {
          const matchData = await lolApi.MatchV5.get(
            matchId,
            Constants.RegionGroups.AMERICAS
          );
          const player = matchData.response.info.participants.find(
            (p) => p.puuid === otherPuuid
          );

          return {
            kills: player?.kills ?? 0,
            deaths: player?.deaths ?? 0,
            assists: player?.assists ?? 0,
            cs:
              (player?.totalMinionsKilled ?? 0) +
              (player?.neutralMinionsKilled ?? 0),
          };
        })
      );

      const numGames = otherMatchStats.length;

      const totalKills = otherMatchStats.reduce((acc, g) => acc + g.kills, 0);
      const totalDeaths = otherMatchStats.reduce((acc, g) => acc + g.deaths, 0);
      const totalAssists = otherMatchStats.reduce(
        (acc, g) => acc + g.assists,
        0
      );
      const totalCs = otherMatchStats.reduce((acc, g) => acc + g.cs, 0);

      const averageKills = parseFloat((totalKills / numGames).toFixed(1));
      const averageDeaths = parseFloat((totalDeaths / numGames).toFixed(1));
      const averageAssists = parseFloat((totalAssists / numGames).toFixed(1));
      const averageCs = parseFloat((totalCs / numGames).toFixed(1));

      otherPlayersAverages[otherPuuid] = {
        averageKills,
        averageDeaths,
        averageAssists,
        averageCs,
      };
    }

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
      .from("players")
      .select("id")
      .eq("riot_id", riotId)
      .eq("tag", tag)
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
    console.log("player PLEASE WORK", playerId);

    const formattedStats = matchStats.map((match) => ({
      match_id: match.matchId,
      kills: match.kills,
      deaths: match.deaths,
      assists: match.assists,
      cs: match.cs,
      team_position: match.team_position,
      player_id: playerId,
    }));

    // Sort by match id
    formattedStats.sort((a, b) => {
      if (a.match_id < b.match_id) return 1;
      if (a.match_id > b.match_id) return -1;
      return 0;
    });

    // Insert each and stop at duplicate
    for (const match of formattedStats) {
      const { error } = await supabase.from("match_history").insert([match]);

      if (error) {
        // Check if the error is due to a duplicate match_id
        if (error.code === "23505") {
          break;
        } else {
          // Log any other errors
          console.error("Error inserting match:", error);
          break;
        }
      }
    }

    //console.log("Other Players' Averages:", otherPlayersAverages);
    return {
      roleAverages: await currentPlayerAverages(playerId),
      otherPlayersAverages,
    };
  } catch (error) {
    console.error("Error fetching match history:", error);
  }
}
