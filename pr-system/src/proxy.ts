import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

const PROTECTED_PATHS = ["/dashboard"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path),
  );
  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  if (!token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", String(payload.sub));
    requestHeaders.set("x-user-email", String(payload.email ?? ""));
    requestHeaders.set("x-user-role", String(payload.role ?? ""));

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    const response = NextResponse.redirect(
      new URL("/auth/login", request.url),
    );
    response.cookies.delete("token");
    return response;
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
