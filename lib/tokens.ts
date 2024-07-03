import { getVerficationTokenByEmail } from "@/data/verfication-token";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/db";

export const generateVerficationToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000); // 3600ミリ秒 * 1000(1時間)

  const existingToken = await getVerficationTokenByEmail(email);

  // トークンがあれば削除する
  if (existingToken) {
    await prisma.verficationToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  const verficationToken = await prisma.verficationToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return verficationToken;
};
