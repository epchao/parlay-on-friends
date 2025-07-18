import { createClient } from "@/utils/supabase/server";
import Stripe from "stripe";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const session_id = resolvedSearchParams.session_id;

  if (!session_id) {
    return <p className="text-center mt-10">Invalid payment session.</p>;
  }

  // ✅ 1. Fetch session from Stripe
  const session = await stripe.checkout.sessions.retrieve(session_id);

  if (session.payment_status !== "paid") {
    return <p className="text-center mt-10">Payment not verified.</p>;
  }

  // ✅ 2. Verify user is authenticated
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || session.customer_email !== user.email) {
    return <p className="text-center mt-10">Unauthorized access.</p>;
  }

  // ✅ 3. Update user balance
  const { data: profile } = await supabase
    .from("users")
    .select("account_balance")
    .eq("user_id", user.id)
    .single();

  const newBalance = (profile?.account_balance ?? 0) + 10;

  await supabase
    .from("users")
    .update({ account_balance: newBalance })
    .eq("user_id", user.id);

  return (
    <div className="text-center p-10">
      <h1 className="text-2xl font-bold text-green-600">Payment successful</h1>
      <p>$10 has been added to your account.</p>
      <Button className="mt-4">
        <Link href="/dashboard">Go to Dashboard</Link>
      </Button>
    </div>
  );
}
