const nodemailer = require('nodemailer');

/**
 * Configure Nodemailer transporter based on available environment variables.
 * Supports:
 * - Custom SMTP (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)
 * - Gmail Service (EMAIL_USER, EMAIL_PASS / GMAIL_USER, GMAIL_PASS)
 */
let transporter = null;

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT || 587;
const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER || process.env.GMAIL_USER;
const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.GMAIL_PASS;

if (smtpHost && smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(smtpPort),
    secure: Number(smtpPort) === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });
} else if (smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });
}

/**
 * Send a general email
 */
async function sendEmail({ to, subject, text, html }) {
  const fromAddress = process.env.EMAIL_FROM || smtpUser || 'no-reply@rathoreelectronics.com';

  if (!transporter) {
    console.log('\n================== [EMAIL SERVICE] ==================');
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:    ${text || 'HTML Content'}`);
    console.log('Notice:  Configure SMTP_HOST or EMAIL_USER/EMAIL_PASS in server/.env to send real emails.');
    console.log('=====================================================\n');
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Rathore Electronics" <${fromAddress}>`,
      to,
      subject,
      text,
      html
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[EmailService Error]:', error.message);
    throw error;
  }
}

/**
 * Send an OTP Verification email with a responsive HTML template
 */
async function sendOtpEmail(toEmail, otpCode, purpose = 'Account Verification') {
  const subject = `Your ${purpose} Code: ${otpCode} - Rathore Electronics`;
  
  const text = `Hello,\n\nYour 6-digit OTP verification code for Rathore Electronics is: ${otpCode}.\n\nThis code is valid for 10 minutes. Please do not share this code with anyone.\n\nBest regards,\nRathore Electronics Team`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .card { max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .header { background: #0f172a; padding: 24px; text-align: center; }
        .header h1 { color: #ffffff; font-size: 20px; margin: 0; font-weight: 700; letter-spacing: 0.5px; }
        .content { padding: 32px 24px; text-align: center; }
        .otp-box { background: #f1f5f9; border: 2px dashed #4f46e5; border-radius: 12px; padding: 18px; margin: 24px 0; }
        .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; font-family: monospace; }
        .footer { padding: 20px; background: #f8fafc; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>RATHORE ELECTRONICS</h1>
        </div>
        <div class="content">
          <h2 style="font-size: 18px; margin-top: 0; color: #0f172a;">${purpose}</h2>
          <p style="font-size: 14px; color: #475569; line-height: 1.5;">
            Use the following 6-digit one-time password (OTP) to verify your email address.
          </p>
          <div class="otp-box">
            <span class="otp-code">${otpCode}</span>
          </div>
          <p style="font-size: 12px; color: #64748b; margin: 0;">
            ⏳ This code expires in <strong>10 minutes</strong>. Do not share this code with anyone.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Rathore Electronics. All electrical services & appliances.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: toEmail, subject, text, html });
}

module.exports = {
  sendEmail,
  sendOtpEmail
};
