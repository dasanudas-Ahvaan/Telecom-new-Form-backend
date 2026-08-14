const bcrypt = require("bcrypt");
const { Admin } = require("../../models/adminSchema");
const { generateToken, generateRefreshToken } = require("../../middleware/auth");
const { RefreshToken } = require("../../models/RefreshToken.model");
const crypto = require("crypto");

const login = async (email, password) => {
  try {
    if (!email) {
      throw new Error("Missing email");
    } else if (!password) {
      throw new Error("Missing password");
    }
    const user = await Admin.findOne({ email });
    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid user credentials");

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    await RefreshToken.create({
      userId: user._id,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + 7 * 60 * 60 * 1000), // 7 hours
      revoked: false,
    });

    let userObj = user.toObject();
    delete userObj.password;
    delete userObj.email;
    delete userObj.createdAt;
    delete userObj.updatedAt;
    delete userObj.__v;

    return { token, refreshToken, data: userObj };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = login;
