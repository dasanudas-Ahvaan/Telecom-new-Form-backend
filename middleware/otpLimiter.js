const rateLimit = require("express-rate-limit");

const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 1,
  message: {
    success: false,
    message: "Too many OTP requests. Try later.",
  },
});

module.exports = { otpLimiter };
