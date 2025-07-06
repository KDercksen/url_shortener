import { NextRequest, NextResponse } from "next/server";
import { getRedirect } from "./actions/shorten";
import { notFound } from "next/navigation";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const slug = pathname.split("/").pop();
  // Check if slug is a valid nanoid of length 7
  const match = slug?.match(/^[a-zA-Z0-9_-]{7}$/);
  if (match) {
    // Check if redirect exists - if so, send it
    const url = await getRedirect(match[0]!);
    if (url) {
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}
