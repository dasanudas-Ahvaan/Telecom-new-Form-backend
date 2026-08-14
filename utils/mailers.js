const nodemailer = require("nodemailer");
const emailTemplates = require("../data/mailDraft");
require("dotenv").config();

const sendMail = async (templateKey, recipientEmail, subject, data) => {
  try {
    if (!emailTemplates[templateKey]) {
      throw new Error(`Template '${templateKey}' not found!`);
    }
    const htmlContent = emailTemplates[templateKey](data);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    console.log("✅ Email sent to:", recipientEmail);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("❌ Email Error:", error.message);
    return { success: false, message: error.message };
  }
};

module.exports = sendMail;
