import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/db";
import { getVerificationTokenByEmail } from "@/data/verification-token";

export const generateVerificationToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000); // 3600ミリ秒 * 1000(1時間)

  const existingToken = await getVerificationTokenByEmail(email);

  // トークンがあれば削除する
  if (existingToken) {
    await prisma.verificationToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  const verificationToken = await prisma.verificationToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return verificationToken;
};
