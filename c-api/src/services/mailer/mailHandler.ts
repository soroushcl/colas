import {
  // leadUserInvitedToProject,
  LeadUserInvitedToProjectParams,
} from "./templates/stringTemplates/leadUserInvitedToProject";
import {
  forgotPassword,
  ForgotPasswordParams,
} from "./templates/stringTemplates/forgotPassword";
import {
  orgAdminInvited,
  OrgAdminInvitedParams,
} from "./templates/stringTemplates/orgAdminInvited";
import {
  orgUserInvited,
  OrgUserInvitedParams,
} from "./templates/stringTemplates/orgUserInvited";
import {
  // runningToSimulated,
  RunningToSimulatedParams,
} from "./templates/stringTemplates/runningToSimulated";
import {
  // pendingToUnderReview,
  PendingToUnderReviewParams,
} from "./templates/stringTemplates/pendingToUnderReview";
// import {
//   underReviewToRunning,
// } from "./templates/stringTemplates/underReviewToRunning";
import {
  // underReviewToActionRequired,
  UnderReviewToActionRequiredParams,
} from "./templates/stringTemplates/underReviewToActionRequired";
import {
  // viewerUserInvitedToProject,
  ViewerUserInvitedToProjectParams,
} from "./templates/stringTemplates/viewerUserInvitedToProject";

interface TemplateParameters {
  forgotPassword?: ForgotPasswordParams;
  leadUserInvitedToProject?: LeadUserInvitedToProjectParams;
  orgAdminInvited?: OrgAdminInvitedParams;
  orgUserInvited?: OrgUserInvitedParams;
  pendingToUnderReview?: PendingToUnderReviewParams;
  runningToSimulated?: RunningToSimulatedParams;
  underReviewToActionRequired?: UnderReviewToActionRequiredParams;
  // underReviewToRunning?: UnderReviewToRunningParams;
  viewerUserInvitedToProject?: ViewerUserInvitedToProjectParams;
}

export abstract class MailHandler {
  abstract sendEmail(
    email: string,
    subject: string,
    body: string,
  ): Promise<void>;

  async sendEmailWithTemplate(
    email: string,
    subject: string,
    templateName:
      | "forgotPassword"
      | "leadUserInvitedToProject"
      | "orgAdminInvited"
      | "viewerUserInvitedToProject"
      | "underReviewToActionRequired"
      | "underReviewToRunning"
      | "runningToSimulated"
      | "pendingToUnderReview"
      | "orgUserInvited",
    templateParams: TemplateParameters,
  ): Promise<void> {
    let emailBody = "";

    switch (templateName) {
      case "forgotPassword":
        if (!templateParams.forgotPassword) {
          throw new Error("Missing Inputs templateParams");
        }
        emailBody = forgotPassword(templateParams.forgotPassword);
        break;

      case "orgAdminInvited":
        if (!templateParams.orgAdminInvited) {
          throw new Error("Missing Inputs");
        }
        emailBody = orgAdminInvited(templateParams.orgAdminInvited);
        break;

      case "orgUserInvited":
        if (!templateParams.orgUserInvited) {
          throw new Error("Missing Inputs");
        }
        emailBody = orgUserInvited(templateParams.orgUserInvited);
        break;

      case "leadUserInvitedToProject":
        if (!templateParams.leadUserInvitedToProject) {
          throw new Error("Missing Inputs");
        }
        // emailBody = leadUserInvitedToProject(
        //   templateParams.leadUserInvitedToProject,
        // );
        break;

      case "viewerUserInvitedToProject":
        if (!templateParams.viewerUserInvitedToProject) {
          throw new Error("Missing Inputs");
        }
        // emailBody = viewerUserInvitedToProject(
        //   templateParams.viewerUserInvitedToProject,
        // );
        break;

      case "underReviewToRunning":
        // emailBody = underReviewToRunning();
        break;

      case "runningToSimulated":
        if (!templateParams.runningToSimulated) {
          throw new Error("Missing Inputs");
        }
        // emailBody = runningToSimulated(templateParams.runningToSimulated);
        break;

      case "underReviewToActionRequired":
        if (!templateParams.underReviewToActionRequired) {
          throw new Error("Missing Inputs");
        }
        // emailBody = underReviewToActionRequired(
        //   templateParams.underReviewToActionRequired,
        // );
        break;

      case "pendingToUnderReview":
        if (!templateParams.pendingToUnderReview) {
          throw new Error("Missing Inputs");
        }
        // emailBody = pendingToUnderReview(templateParams.pendingToUnderReview);
        break;

      default:
        throw new Error("Unknown template name");
    }
    if (emailBody === "") {
      return Promise.resolve()
    }
    // if(process.env.NODE_ENV === 'production' || process.env['NODE_ENV'] === 'email' ) await this.sendEmail(email, subject, emailBody);
    // else return Promise.resolve()
    console.log("sendEmailWithTemplate templateParams", templateParams)
    return Promise.resolve()
    // await this.sendEmail(email, subject, emailBody);
  }
}
