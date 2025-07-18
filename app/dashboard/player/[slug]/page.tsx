import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import BetCards from "../../bet-cards";
import { DashboardWrapper } from "../../dashboard-wrapper";
import PlayerDisplay from "../../player-display";
import SubmitBet from "../../submit-bet";

interface PlayerPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function parsePlayerSlug(slug: string): { name: string; tag: string } | null {
  // Parse the slug format: "encodedPlayerName-encodedPlayerTag"
  const parts = slug.split('-');
  if (parts.length !== 2) {
    return null;
  }
  
  try {
    return {
      name: decodeURIComponent(parts[0]),
      tag: decodeURIComponent(parts[1])
    };
  } catch (error) {
    // If decoding fails, return null
    return null;
  }
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Await params before accessing properties
  const resolvedParams = await params;
  
  // Parse the player name and tag from the slug
  const playerInfo = parsePlayerSlug(resolvedParams.slug);
  
  if (!playerInfo) {
    notFound();
  }

  const { name: playerName, tag: playerTag } = playerInfo;

  return (
    <div className="flex-1 w-full flex flex-col gap-6 justify-center items-center">
      <div className="w-full max-w-5xl flex justify-between items-center mb-4 gap-4">
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            ← Search Different Player
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">
          {playerName}#{playerTag}
        </h1>
        <div></div> {/* Spacer for centering */}
      </div>
      
      <DashboardWrapper>
        <PlayerDisplay name={playerName} tag={playerTag} />
        <BetCards />
        <SubmitBet />
      </DashboardWrapper>
    </div>
  );
}
