const fs = require('fs');
const nodemailer = require("nodemailer");
require('dotenv').config();

const transporter = nodemailer.createTransport({
   host: "mailpro4.whc.ca",
   port: 465,
   secure: true,
   auth: {
      user: "no-reply@big-beills-greenhouse.ca",
      pass: process.env.SUPPORT_TEAM_EMAIL_PASSWORD,
   },
});

/**
 * Send a password-reset email to a user using the reset email HTML template.
 *
 * Reads the HTML template at ./email/templates/resetPassword.html, replaces all
 * occurrences of the `{{ resetString }}` placeholder with the provided token,
 * and sends the message via the configured SMTP transporter. Errors from file
 * I/O or the mailer propagate to the caller.
 *
 * @param {string} userEmail - Recipient email address.
 * @param {string} resetString - Password-reset token inserted into the template and reset URL.
 * @returns {Promise<object>} Promise resolving to the transport's send result (mailer-specific info).
 */
async function sendPasswordResetEmail(userEmail, resetString) {

   // get the html file and replace placeholder resetString
   const fileLocation = './email/templates/resetPassword.html';
   let htmlContent = fs.readFileSync(fileLocation, 'utf8');
   htmlContent = htmlContent.replace(/{{\s*resetString\s*}}/g, resetString);

   return transporter.sendMail({
      from: '"Support Team" <no-reply@big-beills-greenhouse.ca>',
      to: userEmail,
      subject: "Password Reset Request - Big Beill's Greenhouse",
      html: htmlContent,
      text: `Reset your password using this link: https://big-beills-greenhouse.ca/reset-password/${resetString}` // fallback for email clients that don't support HTML
   });
}

module.exports = {
   sendPasswordResetEmail
};