import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  try {
    // Connect to DB
    const supabase = await createClient();

    // Get user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Check if authorized
    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log(user.id);

    // Get balance
    const { data, error } = await supabase
      .from("users")
      .select("account_balance")
      .eq("user_id", user.id)
      .single();

    // Check if any errors occured during query
    if (error || !data) {
      return Response.json(
        { error: "Failed to fetch balance" },
        { status: 500 }
      );
    }

    return Response.json({ balance: data.account_balance });
  } catch (error) {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
