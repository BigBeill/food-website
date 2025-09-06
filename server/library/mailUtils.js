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
const fileLocation = './email/templates/resetPassword.html';
const emailTemplate = fs.readFileSync(fileLocation, 'utf8');

async function sendPasswordResetEmail(userEmail, resetString) {

   // get the html file and replace placeholder resetString
   const htmlContent = emailTemplate.replace(/{{\s*resetString\s*}}/g, encodeURIComponent(resetString));

   return transporter.sendMail({
      from: '"Support Team" <no-reply@big-beills-greenhouse.ca>',
      to: userEmail,
      subject: "Password Reset Request - Big Beill's Greenhouse",
      html: htmlContent,
      text: `Reset your password using this link: https://big-beills-greenhouse.ca/reset-password/${encodeURIComponent(resetString)}`,
   });
}

module.exports = {
   sendPasswordResetEmail
};