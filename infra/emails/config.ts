const DEFAULT_FROM_ADDRESS = "TabNinos <no-reply@tabninos.com.br>";

function getFromAddress() {
  return process.env.EMAIL_FROM || DEFAULT_FROM_ADDRESS;
}

function getFromEmail() {
  const fromAddress = getFromAddress();
  const matchedEmail = fromAddress.match(/<(.+)>/);

  return matchedEmail?.[1] || fromAddress;
}

const emailConfig = {
  getFromAddress,
  getFromEmail,
  DEFAULT_FROM_ADDRESS,
};

export default emailConfig;
