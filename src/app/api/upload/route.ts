import {
  S3Client,
  PutObjectCommand,
  ListBucketsCommand,
} from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { files } from "@/models/files";
import { permissions } from "@/models/permissions";
import { users } from "@/models/users";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET() {
  try {
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    if (!response.Buckets) {
      return;
    }
    console.log("Credentials are valid. Your S3 buckets:");
    response.Buckets.forEach((bucket) => {
      console.log(bucket.Name);
    });
    return NextResponse.json({ message: "all good" }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error verifying credentials:", (error as Error).message);
    if ((error as any).Code === "InvalidAccessKeyId") {
      console.error("The AWS Access Key ID you provided is invalid.");
    } else if ((error as any).Code === "SignatureDoesNotMatch") {
      console.error("The AWS Secret Access Key you provided is invalid.");
    }
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}

export async function POST(req: any) {
  try {
    const formData = await req.formData();
    const filesData = formData.getAll("file");
    const cookieStore = cookies();
    const token = cookieStore.get("token");
    const loc = cookieStore.get("location");
    const { value }: any = token || {};
    const { value: valueLoc }: any = loc || {};

    const decoded = verify(value, process.env.JWT_SECRET!) as unknown as {
      id: string;
    };
    const decodedLoc = verify(valueLoc, process.env.JWT_SECRET!) as unknown as {
      location: string;
    };
    const userId = decoded.id;
    const location = decodedLoc.location;

    // Create an array of promises for file uploads and database inserts
    const uploadPromises = filesData.map(async (file: File) => {
      console.log(
        `File name: ${file.name}, File size: ${file.size}, File type: ${file.type}`
      );

      // Convert file to ArrayBuffer and then to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      console.log(`Buffer size: ${buffer.length}`);

      // Define the S3 parameters with the correct Body key
      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${userId}/${file.name}`, // Use userId as a prefix
        Body: buffer, // Correct key is Body, not body
        ContentType: file.type, // Adjust based on your file type
      };

      const command = new PutObjectCommand(params);
      const test = await s3Client.send(command);
      console.log(test);

      await files.create({
        user_id: userId,
        file_name: file.name,
        s3_key: `${userId}/${file.name}`,
        file_size: file.size,
        content_type: file.type,
        folder_id: location,
      });

      await users.updateOne(
        { _id: userId },
        { $inc: { used_storage: file.size } }
      );
    });

    // Wait for all uploads and inserts to complete
    await Promise.all(uploadPromises);

    // Return response after all operations are complete
    return NextResponse.json(
      { message: "Files uploaded successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error during upload." },
      { status: 500 }
    );
  }
}

// export async function POST(req: any) {
//   try {
//     const formData = await req.formData();
//     const filesData = formData.getAll("file");
//     const cookieStore = cookies();
//     const token = cookieStore.get("token");
//     const loc = cookieStore.get("location");
//     const { value }: any = token || {};
//     const { value: valueLoc }: any = loc || {};

//     const decoded = verify(value, process.env.JWT_SECRET!) as unknown as {
//       id: string;
//     };
//     const decodedLoc = verify(valueLoc, process.env.JWT_SECRET!) as unknown as {
//       location: string;
//     };
//     const userId = decoded.id;
//     const location = decodedLoc.location;
//     filesData.forEach(async (file: File) => {
//       console.log(
//         `File name: ${file.name}, File size: ${file.size}, File type: ${file.type}`
//       );
//       // Convert file to ArrayBuffer and then to Buffer
//       const arrayBuffer = await file.arrayBuffer();
//       const buffer = Buffer.from(arrayBuffer);
//       console.log(`Buffer size: ${buffer.length}`);

//       // Define the S3 parameters with the correct Body key
//       const params = {
//         Bucket: process.env.AWS_S3_BUCKET_NAME,
//         Key: `${userId}/${file.name}`, // Use userId as a prefix
//         Body: buffer, // Correct key is Body, not body
//         ContentType: file.type, // Adjust based on your file type
//       };

//       const command = new PutObjectCommand(params);
//       const test = await s3Client.send(command);
//       console.log(test);
//       await files.create({
//         user_id: userId,
//         file_name: file.name,
//         s3_key: `${userId}/${file.name}`,
//         file_size: file.size,
//         content_type: file.type,
//         folder_id: location,
//       });
//       await users.updateOne(
//         { _id: userId },
//         { $inc: { used_storage: file.size } }
//       );
//     });

//     return NextResponse.json({ message: "all good" }, { status: 200 });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ message: "error" }, { status: 500 });
//   }
// }
