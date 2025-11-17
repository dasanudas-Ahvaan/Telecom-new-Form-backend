const rateLimit = require("express-rate-limit");

const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 1,
  message: { message: "Too many OTP requests from this IP. Try later." },
});

module.exports = { otpLimiter };
