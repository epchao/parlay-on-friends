import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  // Extract request parameters
  const { user_id, player_id, bet_amount, bet_type } = await request.json();

  // Check all fields were specified
  if (!user_id || !player_id || !bet_amount || !bet_type) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Connect to DB
  const supabase = await createClient();

  const { error } = await supabase
    .from("bets")
    .insert({ user_id, player_id, bet_amount, bet_type });

  if (error) {
    console.log(error);
    return Response.json({ error: "Failed to place bet" }, { status: 500 });
  }

  return Response.json({ user_id, player_id, bet_amount, bet_type });
}
