import { files } from "@/models/files";
import { folders } from "@/models/folders";
import { users } from "@/models/users";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await users.findOne({ _id: params.userId });
    if (!user) {
      return new NextResponse(null, { status: 404 });
    }
    const userResult = {
      _id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      formatted_storage_limit: formatBytes(user.storage_limit),
      formatted_used_storage: formatBytes(user.used_storage),
      created_at: new Date(user.created_at).toDateString(),
    };
    // user.formatted_storage_limit = formatBytes(user.storage_limit);
    // user.formatted_used_storage = formatBytes(user.used_storage);
    // user.created_at = new Date(user.created_at).toDateString();

    const rootFolder = await folders.findOne({
      parent_folder: null,
      user_id: user._id,
    });

    const folderId = new Types.ObjectId(rootFolder._id);
    const contents = await getFolderContents(folderId);
    return NextResponse.json({ user: userResult, contents });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const formattedSize = parseFloat((bytes / Math.pow(1024, i)).toFixed(2));
  return `${formattedSize} ${sizes[i]}`;
}

interface FolderContents {
  folder: {
    _id: Types.ObjectId;
    folder_name: string;
    is_favorite: boolean;
    is_public: boolean;
  };
  files: {
    _id: Types.ObjectId;
    file_name: string;
    file_size: number;
    content_type: string;
    is_favorite: boolean;
    is_deleted: boolean;
  }[];
  subfolders: FolderContents[];
}

async function getFolderContents(
  folderId: Types.ObjectId
): Promise<FolderContents | null> {
  // Fetch the folder
  const folder = await folders.findById(folderId);
  if (!folder) {
    return null;
  }

  // Fetch files in the folder
  const folderFiles = await files.find({ folder_id: folderId });

  // Fetch subfolders
  const subfolders = await folders.find({ parent_folder: folderId });

  // Recursively fetch contents of each subfolder
  const subfolderContents = await Promise.all(
    subfolders.map((subfolder) => getFolderContents(subfolder._id))
  );

  return {
    folder: {
      _id: folder._id,
      folder_name: folder.folder_name,
      is_favorite: folder.is_favorite,
      is_public: folder.is_public,
    },
    files: folderFiles.map((file) => ({
      _id: file._id,
      file_name: file.file_name,
      file_size: file.file_size,
      content_type: file.content_type,
      is_favorite: file.is_favorite,
      is_deleted: file.is_deleted,
    })),
    subfolders: subfolderContents.filter(Boolean) as FolderContents[], // Filter out null values
  };
}
