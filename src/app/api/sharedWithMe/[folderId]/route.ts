import { files } from "@/models/files";
import { folders } from "@/models/folders";
import { permissions } from "@/models/permissions";
import { verify } from "jsonwebtoken";
import { Types } from "mongoose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { folderId: string } }
) {
  const folderId = params.folderId;
  const folder = await folders.findById(folderId);
  if (!folder) {
    return NextResponse.json({}, { status: 404 });
  }

  if (!folder.is_public) {
    const cookieStore = cookies();
    const token = cookieStore.get("token");
    const { value }: any = token || {};
    const decoded = verify(value, process.env.JWT_SECRET!) as unknown as {
      id: string;
      role: string;
    };
    if (decoded.role != "admin") {
      const allowed = await permissions.findOne({
        folderId: folderId,
        userId: decoded.id,
      });
      if (!allowed) {
        return NextResponse.json({}, { status: 403 });
      }
    }
  }
  console.log("masuk");
  const result = await getUserFilesAndFolders(folderId);
  return NextResponse.json(result);
}

async function getUserFilesAndFolders(
  currentFolderId?: string
): Promise<FileOrFolderResult[]> {
  const currentFolder = currentFolderId
    ? new Types.ObjectId(currentFolderId)
    : null;

  // Query folders
  const folderResults = await folders.aggregate([
    {
      $match: {
        ...(currentFolder
          ? { parent_folder: currentFolder }
          : { parent_folder: null }),
      },
    },
    {
      $lookup: {
        from: "files",
        localField: "_id",
        foreignField: "folder_id",
        as: "files",
      },
    },
    {
      $lookup: {
        from: "folders",
        localField: "_id",
        foreignField: "parent_folder",
        as: "subfolders",
      },
    },
    {
      $addFields: {
        total_size: { $sum: "$files.file_size" },
        itemCount: { $add: [{ $size: "$files" }, { $size: "$subfolders" }] },
      },
    },
    {
      $project: {
        _id: 1,
        name: "$folder_name",
        type: { $literal: "folder" },
        itemCount: 1,
        total_size: 1,
        is_favorite: 1,
        parent_folder: 1,
        created_at: 1,
        updated_at: 1,
      },
    },
  ]);

  // Query files
  const fileResults = await files.aggregate([
    {
      $match: {
        is_deleted: false,
        ...(currentFolder ? { folder_id: currentFolder } : { folder_id: null }),
      },
    },
    {
      $project: {
        _id: 1,
        name: "$file_name",
        type: { $literal: "file" },
        s3_key: 1,
        file_size: 1,
        content_type: 1,
        is_favorite: 1,
        parent_folder: "$folder_id",
        created_at: 1,
        updated_at: 1,
      },
    },
  ]);

  // Format sizes in application code
  const formattedFolderResults = folderResults.map((folder) => ({
    ...folder,
    formatted_total_size: formatBytes(folder.total_size || 0),
  }));

  const formattedFileResults = fileResults.map((file) => ({
    ...file,
    formatted_file_size: formatBytes(file.file_size || 0),
  }));

  // Combine and return results
  return [...formattedFolderResults, ...formattedFileResults];
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const formattedSize = parseFloat((bytes / Math.pow(1024, i)).toFixed(2));
  return `${formattedSize} ${sizes[i]}`;
}

interface FileOrFolderResult {
  _id: Types.ObjectId;
  name: string;
  type: "file" | "folder";
  itemCount?: number;
  s3_key?: string;
  file_size?: number;
  content_type?: string;
  is_favorite?: boolean;
  is_deleted?: boolean;
  folder_id?: Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}
