import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import authConfig from "@/auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/db";
import { getUserById } from "./data/user";
import { UserRole } from "@prisma/client";

// アダプターは認証システムとデータベースを接続するためのインターフェース
export const {
  handlers: { GET, POST },
  signIn,
  signOut,
  auth,
} = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  // 認証に関連するアクションが実行されたときに呼び出される非同期関数を定義する
  events: {
    // ユーザーが新しいプロバイダーアカウントを既存のアカウントにリンクする際に必要なカスタム処理を実行するために使用される(googleやgithubでサインインやアカウント作成をするときに実行される)
    async linkAccount({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
  callbacks: {
    // ユーザーがサインアップできるかどうかを制御する
    async signIn({ user, account }) {
      // OAuth認証を許可する
      if (account?.provider !== "credentials") return true;

      const existingUser = await getUserById(user.id!);

      // メール認証なしでサインインできないようにする
      if (!existingUser?.emailVerified) return false;

      // 2段階認証チェック
      return true;
    },
    // クライアントサイドやサーバーサイドでセッションデータを取得する際に実行される
    // session関数では引数にjwt関数からリターンしたtokenを受け取る。token.subにはユーザの識別子などJWTの主体が格納される
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }
      return session;
    },
    // 認証が必要なリクエストごとに呼び出される
    async jwt({ token }) {
      if (!token.sub) return token;
      const existingUser = await getUserById(token.sub);
      // 受け取ったトークンに対応するユーザーがいなければトークンをそのまま返す
      if (!existingUser) return token;

      // tokenに権限プロパティを追加する
      token.role = existingUser.role;

      return token;
    },
  },
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
});
