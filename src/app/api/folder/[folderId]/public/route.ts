import { folders } from "@/models/folders";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { folderId: string } }
) {
  try {
    const data = await request.json();
    await folders.findOneAndUpdate(
      { _id: params.folderId },
      { $set: { is_public: data.is_public } }
    );
    return NextResponse.json({ message: "Folder is now public" });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}
