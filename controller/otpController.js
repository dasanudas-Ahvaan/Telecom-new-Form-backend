const { default: mongoose } = require("mongoose");
const { Member } = require("../models/OnboardingFormSchema.js");
const sendMail = require("../utils/mailers.js");
const { EmailOTP } = require("../models/otpSchema.js");

const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email required" });
    }
    const existingMember = await Member.findOne({ email });
    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered",
      });
    }

    const existingOTP = await EmailOTP.findOne({ email });
    const now = Date.now();
    //logical rate limit
    if (existingOTP) {
      if (now - existingOTP.createdAt.getTime() < 5 * 60 * 1000) {
        return res.status(429).json({
          success: false,
          message: "OTP already sent. Please wait 5 minutes before retrying.",
        });
      }
      await EmailOTP.findOneAndDelete({ email });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    await EmailOTP.create({
      email,
      otp: hashedOtp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      createdAt: new Date(),
    });

    await sendMail(
      email,
      "Your OTP Verification Code",
      `<h3>Your OTP is: <b>${otp}</b></h3>`
    );

    res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.log("OTP Error:", error);
    res.status(500).json({ success: false, message: "Error sending OTP" });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP required" });
  }

  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  const record = await EmailOTP.findOne({
    email,
    otp: hashedOtp,
    expiresAt: { $gt: Date.now() },
  });

  if (!record)
    return res.status(400).json({ message: "Invalid or expired OTP" });
  record.verified = true;
  await record.save();
  res.json({ success: true, message: "OTP verified successfully" });
};
module.exports = { sendOTP, verifyOTP };
