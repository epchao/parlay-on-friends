import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import PlayerSearchForm from "./player-search-form";

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
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          Track a Player
        </h1>
        <PlayerSearchForm />
      </div>
    </div>
  );
}
