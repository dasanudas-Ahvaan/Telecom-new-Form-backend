const mongoose = require("mongoose");

// Example schema concept for token tracking / rotation
const RefreshTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  tokenHash: { type: String, required: true }, // Store hashed version of the refresh token
  expiresAt: { type: Date, required: true },
  revoked: { type: Boolean, default: false },
});
const RefreshToken = mongoose.model("RefreshToken", RefreshTokenSchema);
module.exports = { RefreshToken };
