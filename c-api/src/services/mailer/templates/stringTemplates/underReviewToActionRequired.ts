export interface UnderReviewToActionRequiredParams {
  viewAssessmentLink: string;
}

export const underReviewToActionRequired = (
  inputs: UnderReviewToActionRequiredParams,
) => {
  const { viewAssessmentLink } = inputs;

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
      background: #fefaec;
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
                  We need you to make some changes to the assessment inputs.
                  <br />
                </p>

                <!-- chevron -->
                <div
                  style="
                    width: 100%;
                    height: 100%;
                    display: flex;

                    flex-direction: row;
                    align-items: flex-start;
                    justify-content: flex-start;
                  "
                >
                  <div
                    style="
                      color: #7c7a73;
                      font-size: 14px;
                      margin-right: 15px;
                      font-family: Arial, sans-serif;
                      font-weight: 400;
                      line-height: 14px;
                      word-wrap: break-word;
                    "
                  >
                    Existing Building Retrofit
                  </div>
                  <div
                    style="
                      color: #7c7a73;
                      font-size: 14px;
                      margin-left: 15px;
                      font-family: Arial, sans-serif;
                      font-weight: 400;
                      line-height: 16px;
                      word-wrap: break-word;
                    "
                  >
                    Residential Tower
                  </div>
                </div>
                <div
                  style="
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: row;
                    margin-top: 8px;
                    align-items: flex-start;
                    justify-content: flex-start;
                  "
                >
                  <div
                    style="
                      color: #3e3d39;

                      font-size: 16px;
                      font-family: Arial, sans-serif;
                      font-weight: 400;
                      line-height: 14px;
                      word-wrap: break-word;
                    "
                  >
                    Decarbonization:
                  </div>
                  <div
                    style="
                      color: #01665e;
                      font-size: 16px;
                      margin-left: 4px;
                      font-family: Arial, sans-serif;
                      font-weight: 400;
                      line-height: 16px;
                      word-wrap: break-word;
                    "
                  >
                    Energy & GHG Optimization Study
                  </div>
                </div>
                <div
                  style="
                    width: 100%;
                    height: 100%;
                    display: flex;
                    margin-top: 24px;
                    flex-direction: row;
                    align-items: flex-start;
                    justify-content: flex-start;
                  "
                >
                  <div
                    style="
                      color: #3e3d39;
                      background-color: #e0e0de;
                      font-size: 12px;
                      border-radius: 30px;
                      padding: 10px;
                      margin-right: 15px;
                      font-family: Arial, sans-serif;
                      font-weight: 400;
                      line-height: 14px;
                      text-decoration: line-through;
                      word-wrap: break-word;
                    "
                  >
                    Under Review
                  </div>
                  <div
                    style="
                      color: #3e3d39;
                      background-color: #fdeeb6;
                      font-size: 12px;
                      border-radius: 30px;
                      padding: 10px;
                      margin-right: 15px;
                      font-family: Arial, sans-serif;
                      font-weight: 400;
                      line-height: 14px;
                      word-wrap: break-word;
                    "
                  >
                    Action Required
                  </div>
                </div>
                <div
                  style="
                    color: #3e3d39;
                    font-size: 16px;
                    font-weight: 400;
                    line-height: 24px;
                    margin-top: 32px;
                    margin-bottom: 24px;
                  "
                >
                  View your assessment by clicking the button below:
                </div>
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center" style="padding-right: 20px">
                      <a
                        href="${viewAssessmentLink}"
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
                        VIEW ASSESSMENT
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
                    margin-top: 32px;
                  "
                >
                  Re-submit the assessment after updating it, and we will review
                  it right away. <br /><br />— The Cola's Team
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
