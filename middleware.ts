import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

const isProtectedRoute = createRouteMatcher(["dashboard/(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
  if (/^\/(he|en)\/embed(\/|$)/.test(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Skip next-intl for pure API calls
  if (req.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  return handleI18nRouting(req); // i18n for all other pages
});

export const config = {
  matcher: [
    // Skip embed iframe routes, Next.js internals, and static files.
    "/((?!he/embed|en/embed|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Ensure Clerk auth context is available to API routes that call auth().
    "/(api|trpc)(.*)",
  ],
};
