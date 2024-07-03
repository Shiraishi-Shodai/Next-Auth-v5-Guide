import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerficationEmail = async (email: string, token: stirng) => {
  // このリンクでなくてもログイン画面にいけるリンクならOK
  const confirmLink = `http://localhost:3000/auth/new-verfication?token=${token}`;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Confirm your email",
    html: `<p><a href=${confirmLink}>here</a> to confirm email</p>`,
  });
};