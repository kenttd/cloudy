import { cookies } from "next/headers";
import { NextResponse } from "next/server";
export async function GET() {
  cookies().delete("token");
  cookies().delete("refreshToken");
  return NextResponse.json({ message: "Logout success" }, { status: 200 });
}
