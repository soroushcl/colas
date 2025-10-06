import { MailHandler } from "../mailHandler";
import { google } from "googleapis";
import {credentials} from "./credentials";


const scopes = ["https://www.googleapis.com/auth/gmail.send"];
const senderEmail = "noreply@cola.ai";

export class GoogleMailer extends MailHandler {
  async sendEmail(
    recipientEmail: string,
    subject: string,
    emailBody: string,
  ): Promise<void> {
    const jwtClient = new google.auth.JWT(
      credentials.client_email,
      undefined,
      credentials.private_key,
      scopes,
      senderEmail,
    );

    await jwtClient.authorize();
    // const gmail = google.gmail({
    //   version: "v1",
    //   auth: jwtClient,
    // });

    const emailLines = [
      'Content-Type: text/html; charset="UTF-8"\n',
      "MIME-Version: 1.0\n",
      "Content-Transfer-Encoding: 7bit\n",
      `to: ${recipientEmail}\n`,
      "from: " + senderEmail + "\n",
      `subject: ${subject}\n\n`,
      emailBody,
    ];

    const email = emailLines.join("");
    // const encodedEmail = Buffer.from(email).toString("base64url");

    try {
      // await gmail.users.messages.send({
      //   userId: "me",
      //   requestBody: {
      //     raw: encodedEmail,
      //   },
      // });
      console.log("GoogleMailer email", email)
    } catch (error) {
      console.log("Error occurred:", error);
    }
  }
}
