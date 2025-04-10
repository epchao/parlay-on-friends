import { NextResponse } from "next/server";
import { checkGame } from "./checkGame";

export async function GET(
  request: Request,
  context: { params: { puuid: string } }
) {
  const { puuid } = context.params;

  const gameOngoing = await checkGame(puuid);

  return NextResponse.json({ gameOngoing });
}
