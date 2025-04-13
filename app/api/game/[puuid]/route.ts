import { NextResponse } from "next/server";
import { checkGame } from "./checkGame";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ puuid: string }> }
) {
  const puuid = (await params).puuid;

  const gameOngoing = await checkGame(puuid);

  return NextResponse.json({ gameOngoing });
}
