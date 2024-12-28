import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { files } from "@/models/files";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { permissions } from "@/models/permissions";
import { folders } from "@/models/folders";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(
  request: NextRequest,
  { params }: { params: { s3key: string } }
) {
  try {
    const s3key = decodeURIComponent(params.s3key);
    const filename = s3key.split("/").pop(); // Get the last part of the path
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

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    const response = await fetch(signedUrl);
    if (!response.ok) throw new Error("Failed to fetch file from S3");

    const blob = await response.blob();
    const headers = new Headers(response.headers);
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);

    return new NextResponse(blob, {
      headers,
      status: 200,
    });
  } catch (error:unknown) {
    console.error("Error fetching file:", error);
    return NextResponse.json(
      { error: "Failed to fetch file" },
      { status: 500 }
    );
  }
}

// import { NextRequest, NextResponse } from "next/server";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

// const s3Client = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//   },
// });

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { s3key: string } }
// ) {
//   const s3key = decodeURIComponent(params.s3key);
//   const filename = s3key.split("/").pop(); // Get the last part of the path

//   const command = new GetObjectCommand({
//     Bucket: process.env.AWS_S3_BUCKET_NAME,
//     Key: s3key,
//   });

//   try {
//     const downloadUrl = await getSignedUrl(s3Client, command, {
//       expiresIn: 3600,
//       ResponseContentDisposition: `attachment; filename="${filename}"`,
//     });

//     return NextResponse.json({ downloadUrl, filename });
//   } catch (error) {
//     console.error("Error generating signed URL:", error);
//     return NextResponse.json(
//       { error: "Failed to generate download URL" },
//       { status: 500 }
//     );
//   }
// }
