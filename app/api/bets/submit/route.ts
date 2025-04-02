import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    // Extract request parameters
    const { user_id, player_id, selections, amount } = await request.json();

    // Check all fields were specified
    if (!user_id || !player_id || !selections || !amount) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to DB
    const supabase = await createClient();

    // Get balance
    const { data: balanceData, error: balanceError } = await supabase
      .from("users")
      .select("account_balance")
      .eq("user_id", user_id)
      .single();

    // Check if error happened while getting balance
    if (balanceError || !balanceData) {
      return Response.json({ error: "Failed to place bet" }, { status: 500 });
    }

    // Validate Balance
    if (amount > balanceData.account_balance) {
      return Response.json({ error: "Not enough funds" }, { status: 400 });
    }

    const multiplier = selections.length + 1;

    // Insert
    const { error } = await supabase
      .from("bets")
      .insert({ user_id, player_id, selections, amount, multiplier });

    // Check if error happened while inserting
    if (error) {
      return Response.json({ error: "Failed to place bet" }, { status: 500 });
    }

    return Response.json({
      user_id,
      player_id,
      selections,
      amount,
      multiplier,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
