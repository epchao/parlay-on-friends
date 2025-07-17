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

  const playerName = "42ovo";
  const playerTag = "1224";

  let playerId = null;
  try {
    // Try to get player from cache first
    let response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/get-current-game-info?riotId=${playerName}&tag=${playerTag}`,
      { cache: 'no-store' }
    );
    
    // If not in cache, register them
    if (response.status === 404) {
      const registerResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/players/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ riotId: playerName, tag: playerTag }),
          cache: 'no-store'
        }
      );
      
      if (registerResponse.ok) {
        const registerData = await registerResponse.json();
        playerId = registerData.playerId;
      }
    } else if (response.ok) {
      const playerData = await response.json();
      playerId = playerData.currentPlayer?.puuid;
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
