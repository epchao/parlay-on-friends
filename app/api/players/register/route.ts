import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { RiotApi, LolApi, Constants } from "twisted";

const riotApi = new RiotApi({ key: process.env.RIOT_KEY_SECRET });
const lolApi = new LolApi({ key: process.env.RIOT_KEY_SECRET });

async function fetchChampion(
  championId: number | undefined
): Promise<{ championName: string; championImageName: string } | undefined> {
  if (!championId) return undefined;
  
  try {
    const response = await fetch(
      "https://ddragon.leagueoflegends.com/cdn/15.7.1/data/en_US/champion.json"
    );
    const data = await response.json();
    const champions = await data.data;

    for (const champion in champions) {
      if (parseInt(champions[champion].key) === championId) {
        return {
          championName: champions[champion].name,
          championImageName: champions[champion].id,
        };
      }
    }
  } catch (error) {
    console.error(`Error fetching champion data for ID ${championId}:`, error);
  }
  
  return undefined;
}

export async function POST(request: Request) {
  const { riotId, tag } = await request.json();

  if (!riotId || !tag) {
    return NextResponse.json(
      { error: "Missing riotId or tag" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  try {
    // Get account info from Riot API
    const account = await riotApi.Account.getByRiotId(
      riotId,
      tag,
      Constants.RegionGroups.AMERICAS
    );

    if (!account.response.puuid) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    const puuid = account.response.puuid;

    // Check if player already exists
    const { data: existingPlayer } = await supabase
      .from("players")
      .select("id")
      .eq("id", puuid)
      .single();

    if (existingPlayer) {
      return NextResponse.json({
        message: "Player already registered",
        playerId: puuid,
      });
    }

    // Get summoner info
    const summoner = await lolApi.Summoner.getByPUUID(
      puuid,
      Constants.Regions.AMERICA_NORTH
    );

    // Get ranked data
    const rankedData = await lolApi.League.byPUUID(
      puuid,
      Constants.Regions.AMERICA_NORTH
    );

    // Register player in database
    const { error: insertError } = await supabase
      .from("players")
      .insert({
        id: puuid,
        riot_id: riotId,
        tag: tag,
        summoner_level: summoner.response.summonerLevel,
        profile_icon_id: summoner.response.profileIconId,
        rank_data: rankedData.response,
        last_checked: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Error inserting player:", insertError);
      return NextResponse.json(
        { error: "Failed to register player" },
        { status: 500 }
      );
    }

    // Check if player is currently in a game
    try {
      const activeGame = await lolApi.SpectatorV5.activeGame(
        puuid,
        Constants.Regions.AMERICA_NORTH
      );

      // If they're in a game, fetch detailed game data and create a live_games record
      const gameData = activeGame.response;
      const participants = gameData.participants;

      // Find the current player in the participants
      const currentPlayerParticipant = participants.find(
        (p: any) => p.puuid === puuid
      );
      if (!currentPlayerParticipant) {
        throw new Error("Player not found in game participants");
      }

      // Separate teams properly
      const team100 = participants.filter((p: any) => p.teamId === 100);
      const team200 = participants.filter((p: any) => p.teamId === 200);

      const playerTeam = currentPlayerParticipant.teamId;

      // Properly separate allies and enemies based on current player's team
      const allies =
        playerTeam === 100
          ? team100.filter((p: any) => p.puuid !== puuid)
          : team200.filter((p: any) => p.puuid !== puuid);

      const enemies = playerTeam === 100 ? team200 : team100;

      // Build the current player object with rank data and averages
      const rankData = rankedData.response || [];
      const soloRank = rankData.find((r) => r.queueType === "RANKED_SOLO_5x5");
      const flexRank = rankData.find((r) => r.queueType === "RANKED_FLEX_SR");

      // Get champion info for current player
      const championData = await fetchChampion(currentPlayerParticipant.championId);
      let championName = "Unknown";
      let championImageName = "Garen";

      if (championData) {
        championName = championData.championName;
        championImageName = championData.championImageName;
      }

      // Get current player's weighted averages by finding them in the formatted allies/enemies
      // We'll update this after formatting all participants
      const currentPlayerData = {
        puuid: puuid,
        name: riotId,
        tag: tag,
        level: summoner.response.summonerLevel,
        icon: `https://ddragon.leagueoflegends.com/cdn/15.7.1/img/profileicon/${summoner.response.profileIconId}.png`,
        champion: championName,
        championImage: `https://ddragon.leagueoflegends.com/cdn/15.7.1/img/champion/${championImageName}.png`,
        soloDuoRank: soloRank
          ? `${soloRank.tier} ${soloRank.rank}`
          : "Unranked",
        flexRank: flexRank ? `${flexRank.tier} ${flexRank.rank}` : "Unranked",
        soloDuoRankImage: soloRank
          ? `https://opgg-static.akamaized.net/images/medals_new/${soloRank.tier.toLowerCase()}.png`
          : "https://static.wikia.nocookie.net/leagueoflegends/images/1/13/Season_2023_-_Unranked.png",
        flexRankImage: flexRank
          ? `https://opgg-static.akamaized.net/images/medals_new/${flexRank.tier.toLowerCase()}.png`
          : "https://static.wikia.nocookie.net/leagueoflegends/images/1/13/Season_2023_-_Unranked.png",
      };

      // Transform participants to the format expected by the frontend
      const formatParticipant = async (participant: any) => {
        try {
          // Get account info for this participant
          const participantAccount = await riotApi.Account.getByPUUID(
            participant.puuid,
            Constants.RegionGroups.AMERICAS
          );

          // Get their summoner info
          const participantSummoner = await lolApi.Summoner.getByPUUID(
            participant.puuid,
            Constants.Regions.AMERICA_NORTH
          );

          // Get their ranked data
          const participantRanked = await lolApi.League.byPUUID(
            participant.puuid,
            Constants.Regions.AMERICA_NORTH
          );

          const participantSoloRank = participantRanked.response.find(
            (r) => r.queueType === "RANKED_SOLO_5x5"
          );
          const participantFlexRank = participantRanked.response.find(
            (r) => r.queueType === "RANKED_FLEX_SR"
          );

          // Only register this participant if it's the current player
          // For other players, we just format the data for game_data storage
          if (participant.puuid === puuid) {
            const { data: existingParticipant } = await supabase
              .from("players")
              .select("id")
              .eq("id", participant.puuid)
              .single();

            if (!existingParticipant) {
              await supabase
                .from("players")
                .insert({
                  id: participant.puuid,
                  riot_id: participantAccount.response.gameName,
                  tag: participantAccount.response.tagLine,
                  summoner_level: participantSummoner.response.summonerLevel,
                  profile_icon_id: participantSummoner.response.profileIconId,
                  rank_data: participantRanked.response,
                  last_checked: new Date().toISOString(),
                });
            }
          }

          // Calculate weighted averages on-the-fly from recent matches
          let avgKills = 0;
          let avgDeaths = 0;
          let avgAssists = 0;
          let avgCs = 0;

          try {
            const participantMatchList = await lolApi.MatchV5.list(
              participant.puuid,
              Constants.RegionGroups.AMERICAS,
              { count: 5 } // Last 5 matches
            );

            const matches = [];
            for (const matchId of participantMatchList.response) {
              try {
                const match = await lolApi.MatchV5.get(
                  matchId,
                  Constants.RegionGroups.AMERICAS
                );
                const matchParticipant = match.response.info.participants.find(
                  (p) => p.puuid === participant.puuid
                );

                if (matchParticipant) {
                  matches.push({
                    kills: matchParticipant.kills,
                    deaths: matchParticipant.deaths,
                    assists: matchParticipant.assists,
                    cs:
                      matchParticipant.totalMinionsKilled +
                      matchParticipant.neutralMinionsKilled,
                  });
                }
              } catch (matchError) {
                console.error(
                  `Error fetching match ${matchId} for participant:`,
                  matchError
                );
              }
            }

            // Calculate weighted averages (more recent games have higher weight)
            if (matches.length > 0) {
              let weightedKillsSum = 0;
              let weightedDeathsSum = 0;
              let weightedAssistsSum = 0;
              let weightedCsSum = 0;
              let totalWeight = 0;
              const decayFactor = 0.95;

              matches.forEach((match, index) => {
                const weight = Math.pow(decayFactor, index);
                weightedKillsSum += match.kills * weight;
                weightedDeathsSum += match.deaths * weight;
                weightedAssistsSum += match.assists * weight;
                weightedCsSum += match.cs * weight;
                totalWeight += weight;
              });

              avgKills = weightedKillsSum / totalWeight;
              avgDeaths = weightedDeathsSum / totalWeight;
              avgAssists = weightedAssistsSum / totalWeight;
              avgCs = weightedCsSum / totalWeight;
            }
          } catch (historyError) {
            console.error(
              `Error fetching match history for participant ${participant.puuid}:`,
              historyError
            );
          }

          // Get champion name from champion ID
          const championData = await fetchChampion(participant.championId);
          let championName = "Unknown";
          let championImageName = "Garen";

          if (championData) {
            championName = championData.championName;
            championImageName = championData.championImageName;
          }

          return {
            puuid: participant.puuid,
            name: participantAccount.response.gameName,
            tag: participantAccount.response.tagLine,
            level: participantSummoner.response.summonerLevel,
            icon: `https://ddragon.leagueoflegends.com/cdn/15.7.1/img/profileicon/${participantSummoner.response.profileIconId}.png`,
            champion: championName,
            championImage: `https://ddragon.leagueoflegends.com/cdn/15.7.1/img/champion/${championImageName}.png`,
            soloDuoRank: participantSoloRank
              ? `${participantSoloRank.tier} ${participantSoloRank.rank}`
              : "Unranked",
            flexRank: participantFlexRank
              ? `${participantFlexRank.tier} ${participantFlexRank.rank}`
              : "Unranked",
            soloDuoRankImage: participantSoloRank
              ? `https://opgg-static.akamaized.net/images/medals_new/${participantSoloRank.tier.toLowerCase()}.png`
              : "https://static.wikia.nocookie.net/leagueoflegends/images/1/13/Season_2023_-_Unranked.png",
            flexRankImage: participantFlexRank
              ? `https://opgg-static.akamaized.net/images/medals_new/${participantFlexRank.tier.toLowerCase()}.png`
              : "https://static.wikia.nocookie.net/leagueoflegends/images/1/13/Season_2023_-_Unranked.png",
            avgKills: avgKills,
            avgDeaths: avgDeaths,
            avgAssists: avgAssists,
            avgCs: avgCs,
          };
        } catch (error) {
          console.error(
            `Error fetching data for participant ${participant.puuid}:`,
            error
          );
          // Return basic data if we can't fetch detailed info
          const championData = await fetchChampion(participant.championId);
          let championName = "Unknown";
          let championImageName = "Garen";

          if (championData) {
            championName = championData.championName;
            championImageName = championData.championImageName;
          }

          return {
            puuid: participant.puuid,
            name: "Unknown",
            tag: "UNK",
            level: 30,
            icon: "https://ddragon.leagueoflegends.com/cdn/15.7.1/img/profileicon/29.png",
            champion: championName,
            championImage: `https://ddragon.leagueoflegends.com/cdn/15.7.1/img/champion/${championImageName}.png`,
            soloDuoRank: "Unranked",
            flexRank: "Unranked",
            soloDuoRankImage:
              "https://static.wikia.nocookie.net/leagueoflegends/images/1/13/Season_2023_-_Unranked.png",
            flexRankImage:
              "https://static.wikia.nocookie.net/leagueoflegends/images/1/13/Season_2023_-_Unranked.png",
            avgKills: 0,
            avgDeaths: 0,
            avgAssists: 0,
            avgCs: 0,
          };
        }
      };

      // Format all allies and enemies (this might take a moment due to API calls)
      console.log("Fetching ally and enemy data...");
      const formattedAllies = await Promise.all(allies.map(formatParticipant));
      const formattedEnemies = await Promise.all(
        enemies.map(formatParticipant)
      );

      // Get current player's averages by formatting their data too
      const currentPlayerFormatted = await formatParticipant(
        currentPlayerParticipant
      );

      // Create the complete game data object with current player including averages
      const completeGameData = {
        currentPlayer: {
          ...currentPlayerData,
          avgKills: currentPlayerFormatted.avgKills,
          avgDeaths: currentPlayerFormatted.avgDeaths,
          avgAssists: currentPlayerFormatted.avgAssists,
          avgCs: currentPlayerFormatted.avgCs,
        },
        allies: formattedAllies,
        enemies: formattedEnemies,
        allyColor: playerTeam === 100 ? "blue" : "red",
      };

      const { error: liveGameError } = await supabase
        .from("live_games")
        .insert({
          id: `NA1_${activeGame.response.gameId}`,
          player_id: puuid,
          game_start_time: activeGame.response.gameStartTime,
          status: "in_progress",
          game_data: completeGameData,
        });

      if (liveGameError) {
        console.error("Error inserting live game:", liveGameError);
      } else {
        console.log(
          `Successfully created live game with complete data for ${riotId}#${tag}`
        );
      }
    } catch (gameError: any) {
      // No active game found, that's fine
      console.log(`No active game for ${riotId}#${tag}`);
    }

    // Calculate weighted averages for the main player on-the-fly
    try {
      const matchList = await lolApi.MatchV5.list(
        puuid,
        Constants.RegionGroups.AMERICAS,
        { count: 5 } // Last 5 matches
      );

      const matches = [];
      for (const matchId of matchList.response) {
        try {
          const match = await lolApi.MatchV5.get(
            matchId,
            Constants.RegionGroups.AMERICAS
          );
          const participant = match.response.info.participants.find(
            (p) => p.puuid === puuid
          );

          if (participant) {
            matches.push({
              kills: participant.kills,
              deaths: participant.deaths,
              assists: participant.assists,
              cs:
                participant.totalMinionsKilled +
                participant.neutralMinionsKilled,
            });
          }
        } catch (matchError) {
          console.error(`Error fetching match ${matchId}:`, matchError);
        }
      }

      // Store weighted averages in the player record for easy access
      if (matches.length > 0) {
        let weightedKillsSum = 0;
        let weightedDeathsSum = 0;
        let weightedAssistsSum = 0;
        let weightedCsSum = 0;
        let totalWeight = 0;
        const decayFactor = 0.95;

        matches.forEach((match, index) => {
          const weight = Math.pow(decayFactor, index);
          weightedKillsSum += match.kills * weight;
          weightedDeathsSum += match.deaths * weight;
          weightedAssistsSum += match.assists * weight;
          weightedCsSum += match.cs * weight;
          totalWeight += weight;
        });

        const avgKills = weightedKillsSum / totalWeight;
        const avgDeaths = weightedDeathsSum / totalWeight;
        const avgAssists = weightedAssistsSum / totalWeight;
        const avgCs = weightedCsSum / totalWeight;

        // Update player record with current weighted averages
        await supabase
          .from("players")
          .update({
            weighted_avg_kills: avgKills,
            weighted_avg_deaths: avgDeaths,
            weighted_avg_assists: avgAssists,
            weighted_avg_cs: avgCs,
            last_checked: new Date().toISOString(),
          })
          .eq("id", puuid);
      }
    } catch (historyError) {
      console.error("Error calculating weighted averages:", historyError);
    }

    return NextResponse.json({
      message: "Player registered successfully",
      playerId: puuid,
    });
  } catch (error) {
    console.error("Error registering player:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
