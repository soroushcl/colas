export interface ForgotPasswordParams {
  email: string;
  resetPasswordLink: string;
  linkExpirationTimeOut: string;
}
export const forgotPassword = (inputs: ForgotPasswordParams) => {
  const { email, resetPasswordLink, linkExpirationTimeOut } = inputs;

  return `

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
                  Did you request to reset your password?<br />
                </p>
                <p
                  style="
                    color: #3e3d39;
                    font-size: 16px;
                    font-weight: 400;
                    line-height: 24px;
                  "
                >
                  We’ve received a request to reset the password for the Cola's
                  account associated with ${email}. No changes have
                  been made to your account yet. You can reset your password by
                  clicking the button below:
                </p>        <p
                style="
                  color: #3e3d39;
                  font-size: 16px;
                  font-weight: 400;
                  line-height: 24px;
                "
              >
              You can reset your password by clicking the button below:
              </p>
                <!-- Button -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center" style="padding-right: 20px">
                      <a
                        href="${resetPasswordLink}"
                        style="
                          width: 100%;
                          text-decoration: none;
                          color: white;
                          background-color: #01665e;
                          padding: 10px 20px;
                          border-radius: 4px;
                          display: inline-block;
                        "
                      >
                      RESET PASSWORD
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
                  Please note that this link with expire within ${linkExpirationTimeOut} hours, after
                  which you will have to submit a new password reset request.
                  <br />
                  <div>
                  If you did not request a new password, kindly ignore this
                  email. </div>

                  <br />— The Cola's Team
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
