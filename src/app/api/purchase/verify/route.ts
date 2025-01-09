import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { users } from "@/models/users";
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  try {
    const session_id = searchParams.get("session_id") as string;
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const { tier, id } = session.metadata!;
    await users.updateOne(
      { _id: id },
      { storage_limit: parseInt(tier) * 1024 * 1024 * 1024 }
    );
    return NextResponse.json({ message: "Success" });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err }, { status: 500 });
  }
}
