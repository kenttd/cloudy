import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  try {
    const token = cookieStore.get("token");
    const { value }: any = token || {};
    const decoded = verify(value, process.env.JWT_SECRET!) as unknown as {
      id: string;
    };
    const searchParams = request.nextUrl.searchParams;
    const tier = searchParams.get("tier");
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: 100000 * parseInt(tier?.toString() || "1"),
            product_data: {
              name: `Tier ${tier}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        tier: tier,
        id: decoded.id,
      },
      mode: "payment",
      success_url: `${process.env.BASE_URL}/home?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/home?fail=true`,
    });
    return NextResponse.json({ payment_url: session.url });
  } catch (error) {
    return NextResponse.json({ message: "Error getting url" }, { status: 500 });
  }
}
