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

    await EmailOTP.findOneAndDelete({ email }); // remove old OTP

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await EmailOTP.create({
      email,
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
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
  try {
    const { email, otp } = req.body;

    const record = await EmailOTP.findOne({ email });

    if (!record)
      return res.status(400).json({ success: false, message: "OTP not found" });

    if (record.expiresAt < Date.now())
      return res.status(400).json({ success: false, message: "OTP expired" });

    if (record.otp !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    record.verified = true;
    await record.save();

    return res.json({ success: true, message: "OTP verified" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error verifying OTP" });
  }
};
module.exports = { sendOTP, verifyOTP };
