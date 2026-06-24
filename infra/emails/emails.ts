import nodemailer from "nodemailer";
import { MailOptionsRequest } from "./types/mail-options-request.types";
import { ServiceError } from "../errors/ServiceError";

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
  try {
    await transporter.sendMail(input);
  } catch (error) {
    throw new ServiceError({
      message: "Não foi possível enviar o email.",
      action: "Verifique se o serviço de email está disponível.",
      cause: error,
      context: JSON.stringify(input),
    });
  }
}

const email = {
  send,
};

export default email;
