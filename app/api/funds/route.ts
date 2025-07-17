import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer_email: user.email!,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Add Funds",
          },
          unit_amount: 1000, // $10
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    metadata: {
      user_id: user.id, // optional, for later tracking
    },
  });

  return NextResponse.json({ url: session.url });
}
