"use server";

import { RegisterSchema } from "@/schemas";
import * as z from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { getUserByEmail } from "@/data/user";
import { generateVerficationToken } from "@/lib/tokens";
import { sendVerficationEmail } from "@/lib/mail";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);
  if (!validatedFields) {
    return { error: "Invalid field" };
  }

  const { email, password, name } = validatedFields.data!;
  const hashPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: "Email already in use!" };
  }

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashPassword,
    },
  });

  // 認証トークンをメアドに送信
  const verficationToken = await generateVerficationToken(email);
  await sendVerficationEmail(verficationToken.email, verficationToken.token);

  return { success: "user created" };
};
