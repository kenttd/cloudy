import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { files } from "@/models/files";
import { permissions } from "@/models/permissions";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { folders } from "@/models/folders";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(
  request: Request,
  { params }: { params: { s3key: string } }
) {
  try {
    const s3key = decodeURIComponent(params.s3key);
    const filename = s3key.split("/").pop();
    const file = await files.findOne({ s3_key: s3key });
    if (!file)
      return NextResponse.json(
        { error: "Failed to fetch file" },
        { status: 400 }
      );
    const folderId = file.folder_id;
    const folder = await folders.findById(folderId);
    if (!folder.is_public) {
      const cookieStore = cookies();
      const token = cookieStore.get("token");
      const { value }: any = token || {};
      const decoded = verify(value, process.env.JWT_SECRET!) as unknown as {
        id: string;
      };
      const owned = file?.user_id == decoded.id;
      const allowed = await permissions.findOne({
        userId: decoded.id,
        folderId: folder?._id,
      });
      if (!owned && !allowed)
        return NextResponse.json(
          { error: "Failed to fetch file" },
          { status: 403 }
        );
    }
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: s3key,
    });
    const viewUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });
    return NextResponse.json({ viewUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json({}, { status: 500 });
  }
}
