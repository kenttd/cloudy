import { folders } from "@/models/folders";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json();
  const cookieStore = cookies();
  const token = cookieStore.get("token");
  const loc = cookieStore.get("location");
  const { value }: any = token || {};
  const { value: valueLoc }: any = loc || {};
  const decoded = verify(value, process.env.JWT_SECRET!) as unknown as {
    id: string;
  };
  const decodedLoc = verify(valueLoc, process.env.JWT_SECRET!) as unknown as {
    location: string;
  };
  await folders.create({
    user_id: decoded.id,
    folder_name: data.folderName,
    parent_folder: decodedLoc.location,
  });
  return NextResponse.json({}, { status: 201 });
}
