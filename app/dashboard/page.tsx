import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import BetCard from "./bet-card";
import { MockBetData } from "./mock-bet-data";
import PlayerDisplay from "./player-display";
import SubmitBet from "./submit-bet";

export default async function dashboardPage() {
  // Player info - make this dynamic later
  const playerName = "kat";
  const playerTag = "FFjew";

  const supabase = await createClient();

  // @TODO: is there a cleaner way to get auth user and db user?
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: balanceData, error: _ } = await supabase
      .from("users")
      .select("account_balance")
      .eq("user_id", user?.id)
      .single();

  if (!user) {
    return redirect("/sign-in");
  }

  let playerId = null;
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/get-player?riotId=${playerName}&tag=${playerTag}`,
      { cache: 'no-store' }
    );
    
    if (response.ok) {
      const playerData = await response.json();
      playerId = playerData.puuid;
    }
  } catch (error) {
    console.error("Error fetching player ID:", error);
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-6 justify-center items-center">
      {/* @TODO: use player id instead of recomputing using name and tag */}
      <PlayerDisplay name={playerName} tag={playerTag} />

      <div className='grid gap-4 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2'>
        {MockBetData.map((e, i) => (
          <BetCard
            key={i}
            playerName={e.playerName}
            stat={e.stat}
            type={e.type}
            playerImage={e.playerImage} />
        ))}
      </div>

      {/* @TODO: ensure player is in game before submitting bet */}
      <SubmitBet
        balance={balanceData?.account_balance}
        playerId={playerId}
      />
    </div>
  );
}
