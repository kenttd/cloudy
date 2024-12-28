import { files } from "@/models/files";
import { folders } from "@/models/folders";
import { permissions } from "@/models/permissions";
import { verify } from "jsonwebtoken";
import mongoose, { Types } from "mongoose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = cookies();
  try {
    const token = cookieStore.get("token");
    const { value }: any = token || {};
    const decoded = verify(value, process.env.JWT_SECRET!) as unknown as {
      id: string;
    };
    const result = await getUserFoldersWithPermissions(decoded.id);
    console.log("Result:", result);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ err }, { status: 500 });
  }
}

async function getUserFoldersWithPermissions(userId: string) {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const folderResults = await permissions.aggregate([
      // Match permissions for the given user
      {
        $match: {
          userId: userObjectId,
        },
      },
      // Lookup folder details
      {
        $lookup: {
          from: "folders",
          localField: "folderId",
          foreignField: "_id",
          as: "folder",
        },
      },
      // Unwind the folder array
      {
        $unwind: "$folder",
      },
      // Lookup files in the folder
      {
        $lookup: {
          from: "files",
          localField: "folder._id",
          foreignField: "folder_id",
          as: "files",
        },
      },
      // Lookup subfolders
      {
        $lookup: {
          from: "folders",
          localField: "folder._id",
          foreignField: "parent_folder",
          as: "subfolders",
        },
      },
      // Add calculated fields
      {
        $addFields: {
          total_size: { $sum: "$files.file_size" },
          itemCount: { $add: [{ $size: "$files" }, { $size: "$subfolders" }] },
        },
      },
      // Project final results
      {
        $project: {
          _id: "$folder._id",
          name: "$folder.folder_name",
          type: { $literal: "folder" },
          itemCount: 1,
          total_size: 1,
          is_favorite: "$folder.is_favorite",
          parent_folder: "$folder.parent_folder",
          created_at: "$folder.created_at",
          updated_at: "$folder.updated_at",
        },
      },
    ]);

    const formattedFolderResults = folderResults.map((folder) => ({
      ...folder,
      formatted_total_size: formatBytes(folder.total_size || 0),
    }));

    return formattedFolderResults;
  } catch (error) {
    console.error("Error in getUserFoldersWithPermissions:", error);
    throw error;
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const formattedSize = parseFloat((bytes / Math.pow(1024, i)).toFixed(2));
  return `${formattedSize} ${sizes[i]}`;
}
