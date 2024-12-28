import { users } from "@/models/users";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  try {
    const keyword = searchParams.get("keyword");

    if (!keyword) return NextResponse.json({}, { status: 400 });
    console.log("test");
    const result = await users.find(
      {
        email: { $regex: keyword, $options: "i" },
      },
      "name avatar email"
    );
    console.log("aaaaaa", result);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json(err);
  }
}
