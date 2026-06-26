import { Resend } from "resend";
import { readFileSync } from "fs";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(toEmail: string, resetToken: string): Promise<void> {
   const template = readFileSync("src/emails/resetPassword.html", "utf-8");
   const html = template.replace("{{resetString}}", resetToken);

   await resend.emails.send({
      from: "no-reply@big-beills-greenhouse.ca",
      to: toEmail,
      subject: "Password Reset - Big Beill's Greenhouse",
      html,
   });
}