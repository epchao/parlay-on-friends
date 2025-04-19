import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import BetCard from "./bet-card";
import { MockBetData } from "./mock-bet-data";
import PlayerDisplay from "./player-display";
import SubmitBet from "./submit-bet";
import { DashboardWrapper } from "./dashboard-wrapper";

export default async function dashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-6 justify-center items-center">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated
          user
        </div>
      </div>

      <div className="flex flex-col gap-2 items-start mr-auto">
        <h2 className="font-bold text-2xl mb-4">Your user details</h2>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <DashboardWrapper>
        <PlayerDisplay name="WEEKLY QUITTER" tag="hiho" />

        <div className="grid gap-4 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2">
          {MockBetData.map((e, i) => (
            <BetCard
              key={i}
              playerName={e.playerName}
              stat={e.stat}
              type={e.type}
              playerImage={e.playerImage}
            />
          ))}
        </div>

        <SubmitBet />
      </DashboardWrapper>
    </div>
  );
}
