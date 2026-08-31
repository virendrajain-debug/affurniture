import nodemailer from 'nodemailer';
import pool from '../config/db.js';

const SMTP_FROM = process.env.SMTP_FROM || 'noreply@affurnishings.co.nz';
const FALLBACK_EMAIL = process.env.ADMIN_EMAIL || 'affurnishings@gmail.com';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '25'),
  secure: false,
  tls: { rejectUnauthorized: false },
});

async function getAdminEmail() {
  try {
    const [rows] = await pool.execute("SELECT value FROM site_settings WHERE key = 'admin_notification_email'");
    if (rows.length > 0 && rows[0].value && rows[0].value.includes('@')) {
      return rows[0].value;
    }
  } catch (err) {
    console.error('[EMAIL] Failed to fetch admin email from settings:', err.message);
  }
  return FALLBACK_EMAIL;
}

export async function sendEnquiryEmail(enquiry) {
  try {
    const to = await getAdminEmail();
    await transporter.sendMail({
      from: SMTP_FROM,
      to,
      subject: `[New Enquiry] ${enquiry.product_name || enquiry.type || 'General'} - ${enquiry.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #AA7A3E;">New Customer Enquiry</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; font-weight: bold;">Name:</td><td style="padding: 8px;">${enquiry.name}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;">${enquiry.email}</td></tr>
            ${enquiry.phone ? `<tr><td style="padding: 8px; font-weight: bold;">Phone:</td><td style="padding: 8px;">${enquiry.phone}</td></tr>` : ''}
            ${enquiry.product_name ? `<tr><td style="padding: 8px; font-weight: bold;">Product:</td><td style="padding: 8px;">${enquiry.product_name}</td></tr>` : ''}
            ${enquiry.message ? `<tr><td style="padding: 8px; font-weight: bold;">Message:</td><td style="padding: 8px;">${enquiry.message}</td></tr>` : ''}
            <tr><td style="padding: 8px; font-weight: bold;">Type:</td><td style="padding: 8px;">${enquiry.type || 'product'}</td></tr>
          </table>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">Reply via the admin panel at <a href="https://admin.affurnishings.co.nz">admin.affurnishings.co.nz</a></p>
        </div>
      `,
    });
    console.log(`[EMAIL] Enquiry notification sent to ${to} for: ${enquiry.name}`);
  } catch (err) {
    console.error('[EMAIL] Failed to send enquiry notification:', err.message);
  }
}

export async function sendFinanceEmail(application) {
  try {
    const to = await getAdminEmail();
    await transporter.sendMail({
      from: SMTP_FROM,
      to,
      subject: `[New Finance Application] ${application.first_name} ${application.last_name || ''}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #AA7A3E;">New Finance Application</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; font-weight: bold;">Name:</td><td style="padding: 8px;">${application.first_name} ${application.last_name || ''}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;">${application.email}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Phone:</td><td style="padding: 8px;">${application.phone}</td></tr>
            ${application.address ? `<tr><td style="padding: 8px; font-weight: bold;">Address:</td><td style="padding: 8px;">${application.address}, ${application.city || ''} ${application.state || ''}</td></tr>` : ''}
            ${application.income_source ? `<tr><td style="padding: 8px; font-weight: bold;">Income Source:</td><td style="padding: 8px;">${application.income_source}</td></tr>` : ''}
            ${application.products ? `<tr><td style="padding: 8px; font-weight: bold;">Products:</td><td style="padding: 8px;">${application.products}</td></tr>` : ''}
          </table>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">Review at <a href="https://admin.affurnishings.co.nz">admin.affurnishings.co.nz</a></p>
        </div>
      `,
    });
    console.log(`[EMAIL] Finance application notification sent to ${to} for: ${application.first_name}`);
  } catch (err) {
    console.error('[EMAIL] Failed to send finance notification:', err.message);
  }
}

export async function sendWinzEmail(quote) {
  try {
    const to = await getAdminEmail();
    await transporter.sendMail({
      from: SMTP_FROM,
      to,
      subject: `[New WINZ Quote Request] ${quote.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #AA7A3E;">New WINZ Quote Request</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; font-weight: bold;">Name:</td><td style="padding: 8px;">${quote.name}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;">${quote.email}</td></tr>
            ${quote.phone ? `<tr><td style="padding: 8px; font-weight: bold;">Phone:</td><td style="padding: 8px;">${quote.phone}</td></tr>` : ''}
            ${quote.product_name ? `<tr><td style="padding: 8px; font-weight: bold;">Product:</td><td style="padding: 8px;">${quote.product_name}</td></tr>` : ''}
            ${quote.message ? `<tr><td style="padding: 8px; font-weight: bold;">Message:</td><td style="padding: 8px;">${quote.message}</td></tr>` : ''}
          </table>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">Review at <a href="https://admin.affurnishings.co.nz">admin.affurnishings.co.nz</a></p>
        </div>
      `,
    });
    console.log(`[EMAIL] WINZ quote notification sent to ${to} for: ${quote.name}`);
  } catch (err) {
    console.error('[EMAIL] Failed to send WINZ notification:', err.message);
  }
}
