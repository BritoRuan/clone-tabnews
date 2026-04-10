import nodemailer from "nodemailer";
import { MailOptionsRequest } from "./types/mail-options-request.types";

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SMTP_HOST,
    port: Number(process.env.EMAIL_SMTP_PORT),
    auth: {
      user: process.env.EMAIL_SMTP_USER,
      pass: process.env.EMAIL_SMTP_PASSWORD,
    },
    secure: process.env.NODE_ENV === "production",
  });
}

async function send(input: MailOptionsRequest) {
  const transporter = createTransporter();
  await transporter.sendMail(input);
}

const email = {
  send,
};

export default email;
