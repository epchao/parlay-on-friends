import { NextResponse } from "next/server";
import { RiotApi, LolApi, Constants } from "twisted";
import { fetchPlayerData } from "../get-player/route";

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

      // Hold current player, blue team, and red team
      let currentPlayer = {};
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
