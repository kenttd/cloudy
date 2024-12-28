import { permissions } from "@/models/permissions";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { folderId: string } }
) {
  try {
    //To do: check if the user has permission to access the folder
    const usersWithPermission = await permissions.aggregate([
      {
        $match: {
          folderId: new Types.ObjectId(params.folderId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          userId: 1,
          folderId: 1,
          "user.name": 1,
          "user.email": 1,
          "user.role": 1,
          "user._id": 1,
          "user.avatar": 1,
        },
      },
    ]);
    console.log(params.folderId);
    return NextResponse.json(usersWithPermission);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}
