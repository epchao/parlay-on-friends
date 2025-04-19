import { NextResponse } from "next/server";
import { RiotApi, LolApi, Constants } from "twisted";
import { fetchPlayerData } from "../get-player/fetchPlayerData";
import { MatchHistoryStats } from "../get-player/matchHistoryStats";
import { Player } from "@/interfaces/player";

const riotApi = new RiotApi({ key: process.env.RIOT_KEY_SECRET });
const lolApi = new LolApi({ key: process.env.RIOT_KEY_SECRET });

export async function GET(request: Request) {
  console.log("starting benchmark");
  const start = Date.now();

  const logTime = (label: string) => {
    console.log(`${label}: ${Date.now() - start}ms`);
  };

  // Get search params
  const { searchParams } = new URL(request.url);
  const riotId = searchParams.get("riotId");
  const tag = searchParams.get("tag");

  if (!riotId || !tag) {
    return NextResponse.json(
      { error: "Missing riotId or tag" },
      { status: 400 }
    );
  }

  try {
    logTime("Start fetching account");
    const account = await riotApi.Account.getByRiotId(
      riotId as string,
      tag as string,
      Constants.RegionGroups.AMERICAS
    );
    logTime("Fetched account");

    if (!account.response.puuid) {
      return NextResponse.json({ error: "Player not found" });
    }

    const currentPlayerPuuid = account.response.puuid;

    try {
      logTime("Start fetching active game");
      const details = await lolApi.SpectatorV5.activeGame(
        currentPlayerPuuid,
        Constants.Regions.AMERICA_NORTH
      );
      logTime("Fetched active game");

      if (![420, 440].includes(details.response.gameQueueConfigId)) {
        return NextResponse.json({
          error: "Player not currently playing a ranked match",
        });
      }

      const gameTime = details.response.gameStartTime;
      let currentPlayer: Player = {} as Player;
      let currentPlayerTeam = 0;
      const blueTeam: Player[] = [];
      const redTeam: Player[] = [];

      logTime("Start fetching participants");
      const participantPromises = details.response.participants.map(
        async (participant: any) => {
          const [name, tag] = participant.riotId.split("#");
          const data = await fetchPlayerData(name, tag);
          return { participant, data };
        }
      );

      const resolvedParticipants = await Promise.all(participantPromises);
      logTime("Fetched participants");

      for (const { participant, data } of resolvedParticipants) {
        if ("error" in data) {
          return NextResponse.json(
            { error: "Error finding all players" },
            { status: 404 }
          );
        }

        if (participant.puuid === currentPlayerPuuid) {
          currentPlayer = data;
          currentPlayerTeam = participant.teamId;
        } else if (participant.teamId === 100) {
          blueTeam.push(data);
        } else {
          redTeam.push(data);
        }
      }

      const allyColor = currentPlayerTeam === 100 ? "blue" : "red";
      const enemyColor = allyColor === "blue" ? "red" : "blue";
      const allies = currentPlayerTeam === 100 ? blueTeam : redTeam;
      const enemies = currentPlayerTeam === 100 ? redTeam : blueTeam;

      logTime("Start fetching match history stats");
      const stats = await MatchHistoryStats(riotId, tag);
      logTime("Fetched match history stats");

      if (!stats || !stats.otherPlayersAverages) {
        return NextResponse.json({ error: "Failed grabbing averages" });
      }

      const kills = stats.currentPlayerAverage.kills;
      const assists = stats.currentPlayerAverage.assists;
      const deaths = stats.currentPlayerAverage.deaths;
      const cs = stats.currentPlayerAverage.cs;
      currentPlayer.avgKda = (kills + assists) / deaths;
      currentPlayer.avgCs = cs;

      const currentPlayerAverages = { kills, deaths, assists, cs };

      for (const ally of allies) {
        const allyStats = stats.otherPlayersAverages[ally.puuid];
        ally.avgKda =
          (allyStats.averageKills + allyStats.averageAssists) /
          allyStats.averageDeaths;
        ally.avgCs = allyStats.averageCs;
      }

      for (const enemy of enemies) {
        const enemyStats = stats.otherPlayersAverages[enemy.puuid];
        enemy.avgKda =
          (enemyStats.averageKills + enemyStats.averageAssists) /
          enemyStats.averageDeaths;
        enemy.avgCs = enemyStats.averageCs;
      }

      logTime("Finished processing everything");
      console.log("ending benchmark");

      return NextResponse.json({
        gameTime,
        currentPlayer,
        currentPlayerAverages,
        allyColor,
        allies,
        enemyColor,
        enemies,
      });
    } catch (error: any) {
      if (error.status === 404) {
        return NextResponse.json({ error: "Player not in game" });
      }
      console.error("Error fetching game data:", error);
    }
  } catch (error) {
    console.error("Error fetching game data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
