const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");

const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  keyGenerator: ipKeyGenerator,
  max: 1,
  message: {
    success: false,
    message: "Too many OTP requests. Try later.",
  },
});

module.exports = { otpLimiter };
