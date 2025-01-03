import { NextResponse } from "next/server";
import { users } from "@/models/users";

import { files } from "@/models/files";
import { folders } from "@/models/folders";
import { Types } from "mongoose";

export async function GET() {
  try {
    const folderId = new Types.ObjectId("66fe06d010c51ec9c52178b2"); // Replace with the desired folder ID
    const contents = await getFolderContents(folderId);
    return NextResponse.json(contents);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
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

// export async function GET() {
//   const result = await files.create({
//     user_id: "userId",
//     file_name: "ile.name",
//     s3_key: "${userId}/${file.name}",
//     file_size: "file.size",
//     content_type: "file.type",
//     folder_id: "location",
//   });
//   console.log(result);
//   return NextResponse.json(result);

//   // // You can now access collections using the `mongoose` instance
//   // const myCollection = db.connection.collection("test");

//   // const docs = await myCollection.find({}).toArray();
//   // return NextResponse.json(docs);
// }
