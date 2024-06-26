"use server";

import Stripe from "stripe";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async () => {
  const h = headers();
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: "price_1PVqTXJ8RVA1P2jGLz42bl4b",
        quantity: 1,
      },
    ],
    payment_method_types: ["card", "ideal"],
    mode: "payment",
    success_url: `${h.get("origin")}/donate/?success=true`,
    cancel_url: `${h.get("origin")}/donate/?canceled=true`,
  });
  if (!session) {
    redirect("/donate/?error=true");
  }
  redirect(session.url as string);
};
