const nodemailer = require("nodemailer");
require("dotenv").config();

const sendMail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
      attachments: [
        {
          filename: "logo.jpg",
          path: "./assets/logo.jpg",
          cid: "logoImage",
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    console.log("✅ Email sent to:", to);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("❌ Email Error:", error.message);
    return { success: false, message: error.message };
  }
};

module.exports = sendMail;
