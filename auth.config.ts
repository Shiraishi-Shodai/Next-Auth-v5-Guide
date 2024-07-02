// 2:19:41
// Edge ランタイムは、認証処理をより高速かつスケーラブルに実行するための環境
// 標準のWeb APIのみを使用しているため、Auth.jsは多くの環境で実行可能。
// 使用しているORMやライブラリがEdgeランタイムに対応していない場合がある。
// その場合、認証設定を複数のファイルに分割することが推奨される。
// Auth.jsにはデフォルトで2つのセッション戦略がある：データベース戦略とJWT戦略。
// Edgeランタイムでデータベース戦略を使用する場合、データベースとアダプターが互換性がある必要がある。
// 互換性がない場合、JWT戦略を使用し、設定を分割してデータベースアクセスを避ける。

// ここにはアダプタに依存しない一般的な設定をすべて書く
import type { NextAuthConfig } from "next-auth";
import credentials from "next-auth/providers/credentials";
import { LoginSchema } from "./schemas";
import { getUserByEmail } from "./data/user";
import bcrypt from "bcryptjs";
import github from "next-auth/providers/github";
import google from "next-auth/providers/google";

export default {
  providers: [
    github({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);
        const { email, password } = validatedFields.data;

        const user = await getUserByEmail(email);
        // パスワードが存在しない場合があるのはGitHubやGoogleでも認証できるから
        if (!user || !password) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(password, user.password!);
        if (passwordMatch) return user;

        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
