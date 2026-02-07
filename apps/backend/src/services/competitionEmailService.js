import { sendEmail } from './email.js';

// ==================== EMAIL SENDING FUNCTIONS ====================

// Send registration approval notification
async function sendRegistrationApproval(data) {
  const dashboardUrl = `${process.env.FRONTEND_URL || 'https://www.theliftingsocial.com'}/dashboard`;
  const html = getRegistrationApprovedEmail({ ...data, dashboardUrl });
  
  return await sendEmail({
    to: data.userEmail,
    subject: `✅ Registration Approved - ${data.competitionName}`,
    html
  });
}

// Send preliminary entry approval
async function sendPreliminaryApproval(data) {
  const dashboardUrl = `${process.env.FRONTEND_URL || 'https://www.theliftingsocial.com'}/dashboard`;
  const html = getPreliminaryApprovedEmail({ ...data, dashboardUrl });
  
  return await sendEmail({
    to: data.userEmail,
    subject: `✅ Preliminary Entry Approved - ${data.competitionName}`,
    html
  });
}

// Send final entry approval
async function sendFinalEntryApproval(data) {
  const dashboardUrl = `${process.env.FRONTEND_URL || 'https://www.theliftingsocial.com'}/dashboard`;
  const html = getFinalEntryApprovedEmail({ ...data, dashboardUrl });
  
  return await sendEmail({
    to: data.userEmail,
    subject: `✅ Final Entry Approved! You're All Set! - ${data.competitionName}`,
    html
  });
}

// Send entry declined notification
async function sendEntryDeclined(data) {
  const dashboardUrl = `${process.env.FRONTEND_URL || 'https://www.theliftingsocial.com'}/dashboard`;
  const html = getEntryDeclinedEmail({ ...data, dashboardUrl });
  
  return await sendEmail({
    to: data.userEmail,
    subject: `❌ Entry is Declined - ${data.competitionName}`,
    html
  });
}

// ==================== EMAIL TEMPLATES ====================

function getRegistrationApprovedEmail(data) {
  const nextStepsText = data.preliminaryEntryOpen
    ? `<p style="margin: 0 0 15px; color: #374151; font-size: 16px; line-height: 1.6;">
         Your next step is to submit your <strong>Preliminary Entry</strong>
         ${data.preliminaryStartDate ? ` starting from <strong>${data.preliminaryStartDate}</strong>` : ''}.
       </p>`
    : '<p style="margin: 0 0 15px; color: #374151; font-size: 16px; line-height: 1.6;">The preliminary entry period will open soon. Watch for updates!</p>';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px;">
              <tr>
                <td style="background-color: #000000; padding: 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Lifting Social</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px 20px; text-align: center;">
                  <div style="width: 80px; height: 80px; background-color: #10b981; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                    <span style="color: white; font-size: 40px;">✓</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 30px 30px; text-align: center;">
                  <h2 style="margin: 0 0 10px; color: #000000; font-size: 24px;">Registration Approved!</h2>
                  <p style="margin: 0; color: #6b7280; font-size: 16px;">You're officially registered for the  <strong>${data.competitionName}</strong> </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 30px 30px;">
                  <p style="margin: 0 0 15px; color: #374151; font-size: 16px;">Hello ${data.athleteName},</p>
                  <p style="margin: 0 0 15px; color: #374151; font-size: 16px;">Great news! Your registration for <strong>${data.competitionName}</strong> has been approved.</p>
                  ${nextStepsText}
                  
                </td>
              </tr>
              <tr>
                <td style="padding: 0 30px 40px; text-align: center;">
                  <a href="${data.dashboardUrl}" style="display: inline-block; padding: 15px 40px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    View Dashboard
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function getPreliminaryApprovedEmail(data) {
  const nextStepsText = data.finalEntryOpen
    ? `<p style="margin: 0 0 15px; color: #374151;">Your next step is to submit your <strong>Final Entry</strong>${data.finalStartDate ? ` starting from <strong>${data.finalStartDate}</strong>` : ''}.</p>`
    : '<p style="margin: 0 0 15px; color: #374151;">The final entry period will open soon. Watch for updates!</p>';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0;">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px;">
              <tr>
                <td style="background-color: #000000; padding: 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px;"> Lifting Social</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px 20px; text-align: center;">
                  <h2 style="margin: 0 0 10px; color: #000000;">Preliminary Entry Approved!</h2>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 30px 30px;">
                  <p style="margin: 0 0 15px; color: #374151;">Hello ${data.athleteName},</p>
                  <p style="margin: 0 0 15px; color: #374151;">Your preliminary entry for <strong>${data.competitionName}</strong> has been approved!</p>
                 
                  ${nextStepsText}
                </td>
              </tr>
              <tr>
                <td style="padding: 0 30px 40px; text-align: center;">
                  <a href="${data.dashboardUrl}" style="display: inline-block; padding: 15px 40px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    View Dashboard
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function getFinalEntryApprovedEmail(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px;">
              <tr>
                <td style="background-color: #000000; padding: 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Lifting Social</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px 20px; text-align: center;">
                  <h2 style="margin: 0 0 10px; color: #000000;">You're All Set!</h2>
                  <p style="margin: 0; color: #6b7280;">Your final entry has been approved</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 30px 30px;">
                  <p style="margin: 0 0 15px; color: #374151;">Hello ${data.athleteName},</p>
                  <p style="margin: 0 0 15px; color: #374151;">Congratulations! Your final entry for <strong>${data.competitionName}</strong> has been approved.</p>
                  <p style="margin: 0 0 15px; color: #374151;">You're all set for competition day on <strong>${data.competitionDate}</strong>!</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 30px 40px; text-align: center;">
                  <a href="${data.dashboardUrl}" style="display: inline-block; padding: 15px 40px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    View Dashboard
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function getEntryDeclinedEmail(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px;">
              <tr>
                <td style="background-color: #000000; padding: 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Lifting Social</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px 20px; text-align: center;">
                  <h2 style="margin: 0 0 10px; color: #000000;">Entry is Declined!</h2>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 30px 30px;">
                  <p style="margin: 0 0 15px; color: #374151;">Hello ${data.athleteName},</p>
                  <p style="margin: 0 0 15px; color: #374151;">Your ${data.entryType} entry for <strong>${data.competitionName}</strong> has been declined.</p>
                  ${data.reason ? `<div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0;">
                    <p style="margin: 0; color: #991b1b;"><strong>Reason:</strong> ${data.reason}</p>
                  </div>` : ''}
                  ${data.canResubmit ? '<p style="margin: 0 0 15px; color: #374151;">Please review the feedback and resubmit your entry with the necessary corrections or contact lifting Social Technical team (Whatsapp:0764829645).</p>' : ''}
                </td>
              </tr>
              ${data.canResubmit ? `<tr>
                <td style="padding: 0 30px 40px; text-align: center;">
                  <a href="${data.dashboardUrl}" style="display: inline-block; padding: 15px 40px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Resubmit Entry
                  </a>
                </td>
              </tr>` : ''}
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export default {
  sendRegistrationApproval,
  sendPreliminaryApproval,
  sendFinalEntryApproval,
  sendEntryDeclined
};
