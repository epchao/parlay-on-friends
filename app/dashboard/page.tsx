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

  const playerName = "meimei";
  const playerTag = "tea";

  return (
    <div className="flex-1 w-full flex flex-col gap-6 justify-center items-center">
      <DashboardWrapper>
        <PlayerDisplay name={playerName} tag={playerTag} />
        <BetCards />
        <SubmitBet />
      </DashboardWrapper>
      <BetWinNotification />
    </div>
  );
}
