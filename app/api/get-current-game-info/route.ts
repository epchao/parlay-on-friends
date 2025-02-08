import { NextResponse } from "next/server";
import { RiotApi, LolApi, Constants } from "twisted";

const riotApi = new RiotApi({ key: process.env.RIOT_KEY_SECRET });
const lolApi = new LolApi({ key: process.env.RIOT_KEY_SECRET });

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

      // Ask eugene what to add for types
      // Hold current player, blue team, and red team
      let currentPlayer = {};
      const blueTeam = [];
      const redTeam = [];

      const participants = details.response.participants;

      for (const participant of participants) {
        const participantName = participant.riotId.split("#");
        // Need to replace with dynamic URL? Ask eugene
        const participantResponse = await fetch(
          `http://localhost:3000/api/get-player?riotId=${participantName[0]}&tag=${participantName[1]}`
        );
        const participantData = await participantResponse.json();

        if (participant.puuid === currentPlayerPuuid) {
          currentPlayer = participantData;
        } else if (participant.teamId === 100) {
          blueTeam.push(participantData);
        } else {
          redTeam.push(participantData);
        }
      }

      const gameInfo = {
        currentPlayer,
        blueTeam,
        redTeam,
      };

      // Return details
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
