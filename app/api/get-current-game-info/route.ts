import { NextResponse } from "next/server";
import { RiotApi, LolApi, Constants } from "twisted";
import { fetchPlayerData } from "../get-player/fetchPlayerData";

const riotApi = new RiotApi({ key: process.env.RIOT_KEY_SECRET });
const lolApi = new LolApi({ key: process.env.RIOT_KEY_SECRET });

const calculateGameTime = (gameStartTime: number) => {
  const currentTime = Date.now();
  const gameSeconds = Math.floor((currentTime - gameStartTime) / 1000);

  const minutes = Math.floor(gameSeconds / 60);
  const seconds = gameSeconds % 60;

  const gameTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return gameTime;
};

export async function GET(request: Request) {
  // Get search params
  const { searchParams } = new URL(request.url);
  const riotId = searchParams.get("riotId");
  const tag = searchParams.get("tag");

  // If params not given
  if (!riotId || !tag) {
    return NextResponse.json(
      { error: "Missing riotId or tag" },
      { status: 400 }
    );
  }

  try {
    // Get account details
    const account = await riotApi.Account.getByRiotId(
      riotId as string,
      tag as string,
      Constants.RegionGroups.AMERICAS
    );

    // If no response
    if (!account.response.puuid) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    // Get PUUID from account details
    const currentPlayerPuuid = account.response.puuid;
    try {
      const details = await lolApi.SpectatorV5.activeGame(
        currentPlayerPuuid,
        Constants.Regions.AMERICA_NORTH
      );

      // Check not RANKED
      // 420 = solo duo
      // 440 = flex
      if (
        details.response.gameQueueConfigId !== 420 ||
        details.response.gameQueueConfigId !== 440
      ) {
        return NextResponse.json(
          { error: "Player not currently playing a ranked match" },
          { status: 404 }
        );
      }

      // Get game time
      const gameTime = calculateGameTime(details.response.gameStartTime);

      // Hold current player, blue team, and red team
      let currentPlayer = {};
      let currentPlayerTeam = 0;
      const blueTeam = [];
      const redTeam = [];

      // List of partcipants from Riot API
      const participants = details.response.participants;

      // Assign each participant into respective group
      for (const participant of participants) {
        const participantName = participant.riotId.split("#");
        const participantData = await fetchPlayerData(
          participantName[0],
          participantName[1]
        );

        if ("error" in participantData) {
          return NextResponse.json(
            { error: "Error finding all players" },
            { status: 404 }
          );
        }

        if (participant.puuid === currentPlayerPuuid) {
          currentPlayer = participantData;
          currentPlayerTeam = participant.teamId;
        } else if (participant.teamId === 100) {
          blueTeam.push(participantData);
        } else {
          redTeam.push(participantData);
        }
      }
      const allies = currentPlayerTeam === 100 ? blueTeam : redTeam;
      const enemies = currentPlayerTeam === 100 ? redTeam : blueTeam;

      const gameInfo = {
        gameTime,
        currentPlayer,
        allies,
        enemies,
      };

      return NextResponse.json(gameInfo);
    } catch (error: any) {
      // Catch 404 error (player not in a game)
      if (error.status === 404) {
        return NextResponse.json(
          { error: "Player not in game" },
          { status: 404 }
        );
      }
      // Other errors
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
