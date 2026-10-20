import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let cachedTransporter = null;

async function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  // If real SMTP credentials are provided, use them
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    cachedTransporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
    console.log(`\x1b[32m✔ Email Service: Configured SMTP with host ${SMTP_HOST}\x1b[0m`);
    return cachedTransporter;
  }

  // Otherwise, fallback to Ethereal Test Account or simulated logging
  try {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`\x1b[33mℹ Email Service: Created Ethereal test mailbox (${testAccount.user})\x1b[0m`);
    return cachedTransporter;
  } catch (err) {
    console.warn('Could not create Ethereal test account, email service will log to console:', err.message);
    return null;
  }
}

/**
 * Send Email Verification Code & Link
 */
export async function sendVerificationEmail({ to, name, code, token, clientUrl }) {
  const verifyLink = `${clientUrl || process.env.CLIENT_URL || 'http://localhost:5173'}?verifyEmail=${encodeURIComponent(to)}&code=${code}`;
  const sender = process.env.EMAIL_FROM || '"Campus Project Hub" <no-reply@campusprojecthub.edu>';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #2563eb, #4f46e5); padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0 0 6px 0; font-size: 24px; font-weight: 800; }
          .header p { margin: 0; font-size: 13px; opacity: 0.9; }
          .content { padding: 32px 24px; }
          .greeting { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
          .intro { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
          .otp-box { background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
          .otp-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 8px; }
          .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1d4ed8; font-family: monospace; }
          .cta-btn { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 12px; }
          .footer { padding: 20px 24px; background: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Campus Project Hub</h1>
            <p>Email Verification Request</p>
          </div>
          <div class="content">
            <div class="greeting">Hello, ${name}!</div>
            <p class="intro">
              Thank you for registering at <strong>Campus Project Hub</strong>. To activate your student, faculty, or coordinator account and access your mandatory project submissions, please verify your email address.
            </p>
            <div class="otp-box">
              <div class="otp-label">Your 6-Digit Verification Code</div>
              <div class="otp-code">${code}</div>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b;">This code expires in 15 minutes.</p>
            </div>
            <div style="text-align: center; margin-top: 24px;">
              <p style="font-size: 13px; color: #64748b; margin-bottom: 12px;">Or simply click the button below to verify instantly:</p>
              <a href="${verifyLink}" class="cta-btn" target="_blank">Verify Email Address</a>
            </div>
          </div>
          <div class="footer">
            <p style="margin: 0;">If you didn't create an account with Campus Project Hub, you can safely ignore this email.</p>
            <p style="margin: 6px 0 0 0;">Campus Project Hub • Academic Year Management System</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const transporter = await getTransporter();

    // Print to server console for convenient developer visibility
    console.log(`\n\x1b[36m==================================================\x1b[0m`);
    console.log(`\x1b[36m📧 [EMAIL VERIFICATION DISPATCH]\x1b[0m`);
    console.log(`To: ${to} (${name})`);
    console.log(`Verification OTP: \x1b[32m\x1b[1m${code}\x1b[0m`);
    console.log(`Direct Link: ${verifyLink}`);
    console.log(`\x1b[36m==================================================\x1b[0m\n`);

    if (transporter) {
      const info = await transporter.sendMail({
        from: sender,
        to,
        subject: `[Campus Project Hub] Verify your email - Code: ${code}`,
        text: `Hello ${name},\n\nYour verification code is: ${code}\nOr verify via link: ${verifyLink}\n\nThis code expires in 15 minutes.`,
        html: htmlContent,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`\x1b[35m🔗 Ethereal Email Preview URL: ${previewUrl}\x1b[0m`);
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: previewUrl || null,
        devCode: code,
      };
    }

    return {
      success: true,
      simulated: true,
      devCode: code,
    };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    // Even if nodemailer fails, return devCode so development and offline testing is not halted
    return {
      success: true,
      error: error.message,
      devCode: code,
    };
  }
}

/**
 * Send Password Reset OTP
 */
export async function sendPasswordResetEmail({ to, name, code, clientUrl }) {
  const sender = process.env.EMAIL_FROM || '"Campus Project Hub" <no-reply@campusprojecthub.edu>';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
          .header { background: #dc2626; padding: 28px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 800; }
          .content { padding: 32px 24px; }
          .otp-box { background: #fef2f2; border: 2px dashed #fca5a5; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
          .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #b91c1c; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Campus Project Hub</h1>
            <p style="margin: 4px 0 0 0; font-size: 13px;">Password Reset Request</p>
          </div>
          <div class="content">
            <p>Hello <strong>${name}</strong>,</p>
            <p>We received a request to reset your password. Use the verification code below to proceed:</p>
            <div class="otp-box">
              <div style="font-size: 12px; font-weight: 700; color: #991b1b; text-transform: uppercase; margin-bottom: 6px;">Reset Code</div>
              <div class="otp-code">${code}</div>
              <p style="margin: 6px 0 0 0; font-size: 12px; color: #7f1d1d;">Valid for 15 minutes.</p>
            </div>
            <p style="font-size: 13px; color: #64748b;">If you did not request a password reset, please secure your account immediately.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const transporter = await getTransporter();

    console.log(`\n\x1b[33m🔑 [PASSWORD RESET DISPATCH] To: ${to} | Code: ${code}\x1b[0m\n`);

    if (transporter) {
      const info = await transporter.sendMail({
        from: sender,
        to,
        subject: `[Campus Project Hub] Password Reset Code: ${code}`,
        text: `Hello ${name},\n\nYour password reset code is: ${code}\nValid for 15 minutes.`,
        html: htmlContent,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      return { success: true, previewUrl: previewUrl || null, devCode: code };
    }

    return { success: true, simulated: true, devCode: code };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return { success: true, devCode: code };
  }
}
