import { folders } from "@/models/folders";
import { permissions } from "@/models/permissions";
import { verify } from "jsonwebtoken";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request, context: { params: Params }) {
  const cookieStore = cookies();
  try {
    const data = await req.json();
    const folderId = data.folderId;
    const userId = context.params.userId;
    if (!folderId) return NextResponse.json({}, { status: 400 });

    const permissionExist = await permissions.findOne({
      userId: userId,
      folderId: folderId,
    });
    if (permissionExist) return NextResponse.json({}, { status: 400 });

    const token = cookieStore.get("token");
    const { value }: any = token || {};
    const decoded = verify(value, process.env.JWT_SECRET!) as unknown as {
      id: string;
    };
    const allowed = await folders.findOne({
      user_id: decoded.id,
      _id: folderId,
    });
    if (!allowed) return NextResponse.json({}, { status: 403 });
    await permissions.create({
      userId: userId,
      folderId: folderId,
    });
    return NextResponse.json({}, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({}, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Params }) {
  const cookieStore = cookies();
  try {
    const data = await req.json();
    const folderId = data.folderId;
    const userId = context.params.userId;
    if (!folderId) return NextResponse.json({}, { status: 400 });

    const token = cookieStore.get("token");
    const { value }: any = token || {};
    const decoded = verify(value, process.env.JWT_SECRET!) as unknown as {
      id: string;
    };
    const allowed = await folders.findOne({
      user_id: decoded.id,
      _id: folderId,
    });
    if (!allowed) return NextResponse.json({}, { status: 403 });
    await permissions.deleteOne({
      userId: userId,
      folderId: folderId,
    });
    return NextResponse.json({}, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({}, { status: 500 });
  }
}
