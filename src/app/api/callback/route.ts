import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { users } from "@/models/users";
import { folders } from "@/models/folders";
import connectDB from "@/database";

export async function GET(request: NextRequest) {
  await connectDB();
  const searchParams = request.nextUrl.searchParams;
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const error = searchParams.get("error");
    const code = searchParams.get("code") ?? "";

    if (error) {
      console.error("OAuth error:", error);
      return NextResponse.redirect(
        `${process.env.BASE_URL}/error?message=${error}`
      );
    }

    const { tokens } = await oauth2Client.getToken(code);
    console.log("Tokens received:", tokens);

    const res = await fetch("https://www.googleapis.com/oauth2/v1/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const data = await res.json();
    console.log("User data:", data);

    let userRes = await users.findOne({ email: data.email });
    let rootFolderId;
    if (!userRes) {
      console.log("Creating new user");
      const newUser = new users({
        google_id: data.id,
        email: data.email,
        name: data.name,
        avatar: data.picture,
      });
      userRes = await newUser.save();
      const rootFolder = new folders({
        user_id: newUser._id,
        folder_name: "root",
      });
      await rootFolder.save();
      rootFolderId = rootFolder._id;
    } else {
      const rootFolder = await folders.findOne().sort({ created_at: 1 });
      rootFolderId = rootFolder._id;
    }
    console.log("User in database:", userRes);

    const token = jwt.sign(
      { id: userRes._id, root: rootFolderId, role: userRes.role },
      process.env.JWT_SECRET ?? ""
    );
    const tokenLoc = jwt.sign(
      { location: rootFolderId },
      process.env.JWT_SECRET ?? ""
    );

    const response = NextResponse.redirect(`${process.env.BASE_URL}/`);
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    response.cookies.set("location", tokenLoc, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    console.log("Redirecting to:", `${process.env.BASE_URL}/`);
    return response;
  } catch (error) {
    console.error("Error in OAuth callback:", error);
    return NextResponse.redirect(
      `${process.env.BASE_URL}/error?message=Internal Server Error`
    );
  }
}
