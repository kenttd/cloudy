import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { folders } from "@/models/folders";
import { jwtVerify, SignJWT } from "jose";

export async function middleware(request: NextRequest) {
  try {
    if (
      request.nextUrl.pathname.startsWith("/login") ||
      request.nextUrl.pathname === "/api/callback" ||
      request.nextUrl.pathname === "/api/getGoogleUrl"
    ) {
      return NextResponse.next();
    }
    let token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    // console.log("cookie", cookie.value);
    // console.log("test bool", !cookie);
    // console.log(request.nextUrl.pathname);
    // console.log(request.nextUrl.pathname === "/home");
    // console.log("test");
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    if (request.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/home", request.url));
    }
    if (request.nextUrl.pathname.startsWith("/home")) {
      const response = NextResponse.next();
      const jwt = await new SignJWT({ location: payload.root })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        // .setIssuer("urn:example:issuer")
        // .setAudience("urn:example:audience")
        .setExpirationTime("1w")
        .sign(secret);
      response.cookies.set("location", jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
      console.log("change", payload.root);

      return response;
    }

    if (request.nextUrl.pathname.startsWith("/folder")) {
      const id = request.nextUrl.pathname.split("/")[2];
      if (!id) return;
      const response = NextResponse.next();
      const jwt = await new SignJWT({ location: id })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        // .setIssuer("urn:example:issuer")
        // .setAudience("urn:example:audience")
        .setExpirationTime("1w")
        .sign(secret);
      response.cookies.set("location", jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
      console.log("change", id);
      return response;
    }

    return NextResponse.next();
    // return NextResponse.redirect(new URL("/login", request.url));
  } catch (err) {}
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
