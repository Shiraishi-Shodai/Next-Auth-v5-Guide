import NextAuth from "next-auth";
import authConfig from "./auth.config";
import {
  DEFAULT_LOGIN_REDIRECT,
  publicRoutes,
  authRoutes,
  apiAuthPrefix,
} from "@/routes";
import next from "next";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  // nextUrlはURLオブジェクトであり、そのpathnameプロパティは現在のURLのパス部分を指す(/auth, /login, /)
  const isApiAuthRouter = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRouter = publicRoutes.includes(nextUrl.pathname);
  const isAuthRouter = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRouter) {
    return null;
  }

  if (isAuthRouter) {
    // auth/loginまたは/auth/registerにアクセスしていてログインしている時
    if (isLoggedIn) {
      // nextUrlはベースURLを表す(localhost:3000)
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return null;
  }

  // ログインしていないかつパブリックページでない時、/auth/loginにリダイレクト
  if (!isLoggedIn && !isPublicRouter) {
    return Response.redirect(new URL("/auth/login", nextUrl));
  }
  return null;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
