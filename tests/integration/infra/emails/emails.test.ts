import email from "@/infra/emails/emails";
import orchestrator from "@/tests/orchestrator";

describe("infra/emails/emails.ts", () => {
  beforeAll(async () => {
    await orchestrator.waitForAllServices();
    await orchestrator.deleteAllEmails();
  });

  describe("Send email to users", () => {
    it("send()", async () => {
      await email.send({
        from: "TabNinos <tabninos+mailcatcher@gmail.com>",
        to: "ruanjbrito@gmail.com",
        subject: "Teste de assunto",
        text: "Teste de corpo",
      });

      await email.send({
        from: "TabNinos <tabninos+mailcatcher@gmail.com>",
        to: "ruanjbrito4242@gmail.com",
        subject: "Último email enviado",
        text: "Corpo do último email",
      });

      const lastEmail = await orchestrator.getLastEmail();

      expect(lastEmail.sender).toBe("<tabninos+mailcatcher@gmail.com>");
      expect(lastEmail.recipients[0]).toBe("<ruanjbrito4242@gmail.com>");
      expect(lastEmail.subject).toBe("Último email enviado");
      expect(lastEmail.text).toBe("Corpo do último email\r\n");
    });
  });
});
