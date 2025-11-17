const express = require("express");
const router = express.Router();
const { otpLimiter } = require("../middleware/otpLimiter.js");
const {
  testController,
  getAllMembers,
  createMember,
  deleteMember,
  updateMember,
  getMemberById,
} = require("../controller/formCrud.js");
const { sendOTP, verifyOTP } = require("../controller/otpController.js");

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚩 Jai Shri Ram!",
  });
});

router.get("/test", testController);

router.post("/members", createMember);

router.post("/otp", otpLimiter, sendOTP);
router.post("/votp", verifyOTP);

module.exports = router;
