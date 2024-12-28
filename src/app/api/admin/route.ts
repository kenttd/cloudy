import { users } from "@/models/users";
import { NextResponse } from "next/server";

export async function GET() {
  const queryUsers = await users.find();
  const result = queryUsers.map((user) => {
    return {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      formatted_storage_limit: formatBytes(user.storage_limit),
      formatted_used_storage: formatBytes(user.used_storage),
      created_at: new Date(user.created_at).toDateString(),
    };
  });
  return NextResponse.json(result);
}
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const formattedSize = parseFloat((bytes / Math.pow(1024, i)).toFixed(2));
  return `${formattedSize} ${sizes[i]}`;
}
