export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/admin/:path*", "/api/upload/:path*", "/api/members/:path*"],
};