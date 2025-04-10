import { NextResponse } from "next/server";
import { checkGame } from "./checkGame";

export async function GET(
  request: Request,
  { params }: { params: { puuid: string } }
) {
  const { puuid } = await params;

  const gameOngoing = checkGame(puuid);

  return NextResponse.json({ gameOngoing });
}
