import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { users } from "@/models/users";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = cookies();
  try {
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

export async function PUT(req: Request) {
  const cookieStore = cookies();
  try {
    const data = await req.json();
    const token = cookieStore.get("token");
    const { value }: any = token || {};
    const decoded = verify(value, process.env.JWT_SECRET!) as unknown as {
      id: string;
    };
    const user = await users.findOne({ _id: decoded.id });
    if (user.role != "admin")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { id, name, email, storage_limit, role } = data;
    await users.updateOne(
      { _id: id },
      {
        name,
        email,
        role,
        storage_limit: storage_limit * 1024 * 1024 * 1024,
      }
    );
    return NextResponse.json({ message: "User updated" }, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err }, { status: 500 });
  }
}
