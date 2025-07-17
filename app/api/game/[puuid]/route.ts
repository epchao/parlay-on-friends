import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ puuid: string }> }
) {
  const { puuid } = await context.params;
  const supabase = await createClient();

  try {
    const { data: liveGame } = await supabase
      .from('live_games')
      .select('status')
      .eq('player_id', puuid)
      .eq('status', 'in_progress')
      .single();

    return NextResponse.json({ 
      gameOngoing: !!liveGame
    });
  } catch (error) {
    console.error('Error checking game status:', error);
    return NextResponse.json({ 
      gameOngoing: false 
    });
  }
}
