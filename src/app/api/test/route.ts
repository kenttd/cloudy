import { NextResponse } from "next/server";
import { users } from "@/models/users";

import { files } from "@/models/files";

export async function GET() {
  const result = await files.create({
    user_id: "userId",
    file_name: "ile.name",
    s3_key: "${userId}/${file.name}",
    file_size: "file.size",
    content_type: "file.type",
    folder_id: "location",
  });
  console.log(result);
  return NextResponse.json(result);

  // // You can now access collections using the `mongoose` instance
  // const myCollection = db.connection.collection("test");

  // const docs = await myCollection.find({}).toArray();
  // return NextResponse.json(docs);
}
