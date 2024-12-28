import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { users } from "@/models/users";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("masuk");
    const cookieStore = cookies();
    const token = cookieStore.get("token");
    const { value }: any = token || {};
    const decoded = verify(value, process.env.JWT_SECRET!) as unknown as {
      id: string;
    };
    const user = await users.findOne({ _id: decoded.id });
    return NextResponse.json(user, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err }, { status: 500 });
  }
}
