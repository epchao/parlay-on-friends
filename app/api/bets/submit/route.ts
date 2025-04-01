import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    // Extract request parameters
    const { user_id, player_id, stat, over, amount, multiplier } =
      await request.json();

    // Check all fields were specified
    if (
      !user_id ||
      !player_id ||
      !stat ||
      over === undefined ||
      !amount ||
      !multiplier
    ) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to DB
    const supabase = await createClient();

    // Insert
    const { error } = await supabase
      .from("bets")
      .insert({ user_id, player_id, stat, over, amount, multiplier });

    // Check if error happened while inserting
    if (error) {
      console.log(error);
      return Response.json({ error: "Failed to place bet" }, { status: 500 });
    }

    return Response.json({
      user_id,
      player_id,
      stat,
      over,
      amount,
      multiplier,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Failed to place bet" }, { status: 500 });
  }
}
