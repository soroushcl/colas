export interface OrgUserInvitedParams {
  companyName: string;
  setPasswordLink: string;
}

export const orgUserInvited = (inputs: OrgUserInvitedParams) => {
  const { companyName, setPasswordLink } = inputs;

  return `

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cola's noreply email</title>
    <style>
      body,
      div,
      p,
      a,
      span {
        font-family: Arial, sans-serif; /* Fallback font */
      }
    </style>
  </head>
  <body
    style="
      background: #f3faf9;
      margin: 0;
      padding: 0;
      width: 100%;
      text-align: center;
    "
  >
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center" style="padding: 0">
          <table
            width="570"
            border="0"
            cellspacing="0"
            cellpadding="0"
            bgcolor="#ffffff"
            style="background: white; margin: 0 auto"
          >
            <tr>
              <td align="left" style="padding: 72px 60px; text-align: left">
                <div style="width: 140px; height: 48px">
                  <img
                    src="https://storage.googleapis.com/adatpis-public/cola_logo.png"
                    alt="Cola's Logo"
                    width="140"
                    height="48"
                  />
                </div>
                <!-- Divider -->
                <hr
                  style="
                    border: 0;
                    border-top: 1px solid #c4c3bf;
                    margin: 20px 0;
                  "
                />
                <!-- Content -->
                <p
                  style="
                    color: #3e3d39;
                    font-size: 16px;
                    font-weight: 600;
                    line-height: 24px;
                  "
                >
                  Welcome to the Cola's platform! <br />
                </p>
                <p
                  style="
                    color: #3e3d39;
                    font-size: 16px;
                    font-weight: 400;
                    line-height: 24px;
                  "
                >
                  As a user, you will be able to collaborate on projects with
                  other members of ${companyName}.<br /><br />Set a password and
                  complete your registration by clicking the button below:
                </p>
                <!-- Button -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center" style="padding-right: 20px">
                      <a
                        href="${setPasswordLink}"
                        style="
                          text-decoration: none;
                          color: white;
                          background-color: #01665e;
                          width: 100%;
                          padding: 10px 20px;
                          border-radius: 4px;
                          display: inline-block;
                        "
                      >
                        SET PASSWORD
                      </a>
                    </td>
                  </tr>
                </table>
                <!-- Footer -->
                <p
                  style="
                    color: #3e3d39;
                    font-size: 16px;
                    font-weight: 400;
                    line-height: 24px;
                  "
                >
                  You are receiving this email because an administrator of
                  ${companyName} added you as a member.<br /><br />— The Cola's
                  Team
                </p>
                <hr
                  style="
                    border: 0;
                    border-top: 1px solid #c4c3bf;
                    margin: 20px 0;
                  "
                />
                <p
                  style="
                    color: #5d5c56;
                    font-size: 14px;
                    font-weight: 400;
                    line-height: 20px;
                    text-align: center;
                  "
                >
                  Need Further Assistance?<br />
                  <a
                    href="https://www.cola.ai"
                    style="text-decoration: none; color: #01665e"
                    >Contact Us</a
                  >
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>



`;
};
