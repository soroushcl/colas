import { MailHandler } from "./mailHandler";
import { GoogleMailer } from "./googleMailer/index";

export const mailHandlerFactory = (mailerMode: string = "gcp"): MailHandler => {
  switch (mailerMode) {
    case "gcp":
      return new GoogleMailer();
    case "aws":
    // aws mailer placeholder
    default:
      throw new Error(`Mailer mode not defined: ${mailerMode}`);
  }
};
