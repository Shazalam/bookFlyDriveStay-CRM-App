import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

export async function sendEmail(to: string, subject: string, html: string) {
   console.log("sending email ====>", to, subject)
  await transporter.sendMail({
    from: `"Car Rentals" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}
