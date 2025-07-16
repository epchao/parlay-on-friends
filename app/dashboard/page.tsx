import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import BetCards from "./bet-cards";
import { DashboardWrapper } from "./dashboard-wrapper";
import PlayerDisplay from "./player-display";
import SubmitBet from "./submit-bet";
import BetWinNotification from "./bet-win-notification";

export default async function dashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const playerName = "im okay";
  const playerTag = "0643";

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
      <DashboardWrapper>
        <PlayerDisplay name={playerName} tag={playerTag} />
        <BetCards />
        <SubmitBet playerId={playerId} />
      </DashboardWrapper>
      <BetWinNotification />
    </div>
  );
}
