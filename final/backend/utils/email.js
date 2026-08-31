import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '25'),
  secure: false,
  tls: { rejectUnauthorized: false },
});

export async function sendOTPEmail(to, otp) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@affurnishings.co.nz',
    to,
    subject: 'AF Furnishings - Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9f7f3;">
        <div style="background: white; border-radius: 16px; padding: 40px; text-align: center;">
          <h1 style="font-size: 22px; color: #2d2d2d; margin-bottom: 8px;">AF Furnishings</h1>
          <p style="font-size: 14px; color: #72695d; margin-bottom: 32px;">Password Reset Request</p>
          <p style="font-size: 14px; color: #555; margin-bottom: 24px;">Use the following code to reset your password:</p>
          <div style="font-size: 36px; font-weight: 700; letter-spacing: 12px; color: #b08e50; background: #f9f7f3; padding: 16px 24px; border-radius: 12px; margin-bottom: 24px;">${otp}</div>
          <p style="font-size: 12px; color: #999;">This code expires in 10 minutes.</p>
          <p style="font-size: 12px; color: #999; margin-top: 8px;">If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `,
  });
}
