import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function GET() {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: 500 * value.tier,
          product_data: {
            name: `Tier ${value.tier}`,
          },
        },
        quantity: value.months,
      },
    ],
    mode: "payment",
    success_url: `${BASE_URL}/api/tiers/success?session_id={CHECKOUT_SESSION_ID}&months=${value.months}&tier=${value.tier}`,
    cancel_url: `${BASE_URL}/api/tiers/fail`,
  });
}
