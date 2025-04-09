import { createClient } from "@/utils/supabase/server";

export const roleAverages = async (role: string, playerId: string) => {
  const supabase = await createClient();
  const types = ["kills", "deaths", "assists", "cs"] as const;

  const averages: Record<string, number> = {};

  for (const type of types) {
    const { data, error } = await supabase
      .from("match_history")
      .select(type)
      .eq("team_position", role)
      .eq("player_id", playerId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error || !data) {
      console.error(`Error fetching ${type}:`, error);
      continue;
    }

    const total = (data as Record<string, number>[]).reduce(
      (sum, item) => sum + (item[type] ?? 0),
      0
    );

    const avg = data.length > 0 ? total / data.length : 0;
    averages[type] = avg;
  }

  return averages;
};
