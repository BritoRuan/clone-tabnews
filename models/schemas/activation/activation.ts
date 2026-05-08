import email from "@/infra/emails/emails";
import { SendEmailToUserRequest } from "./types/send-email-to-user.request.types";

async function sendEmailToUser(input: SendEmailToUserRequest) {
  await email.send({
    from: "TabNinos <tabninos+mailcatcher@gmail.com>",
    to: input.email,
    subject: "Ative seu cadastro no TabNinos!",
    text: `${input.username}, clique no link abaixo para ativar seu cadastro no TabNinos:
    
https://link....

Atenciosamente, 
Equipe TabNinos`,
  });
}

const activation = {
  sendEmailToUser,
};

export default activation;
