import { NextResponse } from "next/server";
import { fetchPlayerData } from "./fetchPlayerData";
import {MatchHistoryStats} from "./matchHistoryStats";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const riotId = searchParams.get("riotId");
  const tag = searchParams.get("tag");

  if (!riotId || !tag) {
    return NextResponse.json(
      { error: "Missing riotId or tag" },
      { status: 400 }
    );
  }

  const playerData = await fetchPlayerData(riotId, tag);

  if ("error" in playerData) {
    return NextResponse.json(
      { error: playerData.error },
      { status: playerData.status }
    );
  }

  console.log("penis inejctor");
  const test = await MatchHistoryStats("PipKnight", "pengu");
  console.log(test);

  return NextResponse.json(playerData);
}
