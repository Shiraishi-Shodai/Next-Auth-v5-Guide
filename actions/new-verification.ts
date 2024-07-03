"use server";

// use serverを付けないと正常に実行されない(クライアントサイドからデータベースを直接操作することを防いだり、環境変数はサーバーサイドからしかアクセスできないから)
import { getUserByEmail } from "@/data/user";
import { getVerificationTokenByToken } from "@/data/verification-token";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";

export const newVerification = async (token: string) => {
  const existingToken = await getVerificationTokenByToken(token);

  if (!existingToken) {
    return { error: "Token does not exist" };
  }

  // トークンの有効期限を確認
  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) {
    return { error: "Token has expired!" };
  }

  // トークンに対応するユーザーが存在するか
  const existingUser = await getUserByEmail(existingToken.email);
  if (!existingUser) {
    return { error: "Email does not exist!" };
  }

  // メール認証結果を反映
  await prisma.user.update({
    where: {
      id: existingUser.id,
    },
    data: {
      emailVerified: new Date(), // メール認証を行った日時を代入
      email: existingToken.email,
    },
  });

  // 不要になったトークンを削除(サインアウト後にログインする際に、再び2段階認証させるため。)
  // await prisma.verificationToken.delete({
  //   where: { id: existingToken.id },
  // });

  return { success: "Email verified" };
};
