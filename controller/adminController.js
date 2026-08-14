const { Admin } = require("../models/adminSchema.js");
const crypto = require("crypto");

const { validateSuperUser } = require("../middleware/superUserValidator.js");
const {
  notFoundJsonResponse,
  unauthorizedJsonResponse,
  internalErrorJsonResponse,
  successJsonResponse,
  badRequestJsonResponse,
} = require("../utils/jsonResponses/jsonResponses.js");
const login = require("../services/adminServices/login.js");
const removeAdmin = require("../services/adminServices/removeAdmin.js");
const resetPassword = require("../services/adminServices/resetpassword.js");
const createAdmin = require("../services/adminServices/createAdmin.js");

const jwt = require("jsonwebtoken");
const {
  generateToken,
  generateRefreshToken,
} = require("../middleware/auth.js");
const { RefreshToken } = require("../models/RefreshToken.model.js");

const environment = process.env.NODE_ENV;

const testAdmin = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin Controller",
  });
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, refreshToken, data } = await login(email, password);
    const isProd = process.env.NODE_ENV === "production";
    const csrfToken = crypto.randomBytes(32).toString("hex");
    res.cookie("token", token, {
      httpOnly: true, // Prevents XSS (JavaScript cannot read this)
      secure: isProd, // Only sent over HTTPS (use false for local dev)
      sameSite: "Strict", // Prevents CSRF
      maxAge: 1000 * 60 * 15, // 15 min in milliseconds
    });
    res.cookie("XSRF-TOKEN", csrfToken, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 1000 * 60 * 15,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "Strict",
      // path: "/api/auth/refresh", // Restrict usage strictly to the refresh endpoint
      maxAge: 7 * 60 * 60 * 1000, // 7 hour
    });
    return res
      .status(200)
      .json(successJsonResponse(true, "Logged in successfully", data));
  } catch (error) {
    if (
      error.message === "Invalid user credentials" ||
      error.message === "Missing email" ||
      error.message === "Missing password" ||
      error.message === "User not found"
    )
      return res.status(401).json(unauthorizedJsonResponse(error.message));
    else {
      return res.status(500).json(internalErrorJsonResponse(error.message));
    }
  }
};

const logoutController = async (req, res) => {
  // Clear the Auth token cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  // Clear the CSRF token cookie
  res.clearCookie("XSRF-TOKEN", {
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

const createAdminController = async (req, res) => {
  const { name, email, password } = req.body;
  const response = await createAdmin(name, email, password);

  return response;
};

const removeAdminController = async (req, res) => {
  const { adminId } = req.params;
  const { email: userEmail } = req.user;

  const result = await removeAdmin(adminId, userEmail);

  return result;
};

// const removeAdminController = async (req, res) => {
//   try {
//     const { adminId } = req.params;
//     const { email: userEmail } = req.user;

//     const result = await removeAdmin(adminId, userEmail);

//     return result;
//     return res
//       .status(200)
//       .json(successJsonResponse(response.success, response.message));
//   } catch (error) {
//     if (error.message === "Missing credentials")
//       return res.status(401).json(unauthorizedJsonResponse(error.message));
//     else if (error.message === "Not found")
//       return res.status(404).json(notFoundJsonResponse(error.message));
//     else if (error.message === "Denied")
//       return res.status(400).json(badRequestJsonResponse(error.message));
//     else return res.json(internalErrorJsonResponse(error.message));
//   }
// };

const resetAdminPasswordController = async (req, res) => {
  const { adminId, newPassword } = req.body;
  const userEmail = req.user.email;

  const response = await resetPassword(adminId, newPassword, userEmail);

  return response;
};

const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({ role: "admin" }).select("-password -__v");

    return res.status(200).json({
      success: true,
      data: admins,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching admins",
      error: error?.message,
    });
  }
};

const rotateRefreshToken = async (req, res) => {
  try {
    // 1. Read the incoming refresh token from the HTTP cookie
    const incomingRefreshToken = req.cookies.refreshToken;
    if (!incomingRefreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token missing" });
    }

    // 2. Verify the incoming refresh token's cryptographic signature
    const payload = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    // 3. Hash the incoming token to look it up in the database
    const incomingHash = crypto
      .createHash("sha256")
      .update(incomingRefreshToken)
      .digest("hex");

    const tokenRecord = await RefreshToken.findOne({ tokenHash: incomingHash });

    // 4. Security check: If token doesn't exist or is already revoked/expired
    if (
      !tokenRecord ||
      tokenRecord.revoked ||
      tokenRecord.expiresAt < new Date()
    ) {
      // SECURITY ALERT: If a revoked token is presented, someone is trying to reuse an old token!
      if (tokenRecord && tokenRecord.revoked) {
        // Revoke ALL active refresh tokens for this user as a safety countermeasure
        await RefreshToken.updateMany(
          { userId: tokenRecord.userId },
          { revoked: true },
        );
      }
      return res
        .status(403)
        .json({ success: false, message: "Invalid or revoked refresh token" });
    }

    // 5. ROTATION: Invalidate this current refresh token so it can never be used again
    tokenRecord.revoked = true;
    await tokenRecord.save();

    // 6. Find the user
    const user = await Admin.findById(payload.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User no longer exists" });
    }

    // 7. Issue a brand new Access Token and a brand new Refresh Token
    const newAccessToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // 8. Save the new refresh token hash to the database
    const newHash = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");
    await RefreshToken.create({
      userId: user._id,
      tokenHash: newHash,
      expiresAt: new Date(Date.now() + 7 * 60 * 60 * 1000), // Fixed to 7 hours (7 * 1h)
      revoked: false,
    });

    const isProd = process.env.NODE_ENV === "production";
    const newCsrfToken = crypto.randomBytes(32).toString("hex");
    const maxLife = 15 * 60 * 1000;

    // 9. REASSIGNMENT: Set the new cookies back on the browser response
    res.cookie("token", newAccessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "Strict",
      maxAge: maxLife, // 15 minutes (align with your access token expiry)
    });

    res.cookie("XSRF-TOKEN", newCsrfToken, {
      secure: isProd,
      sameSite: "Strict",
      maxAge: maxLife,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "Strict",
      maxAge: 7 * 60 * 60 * 1000, // 7 hours
    });
    return res.status(200).json({
      success: true,
      message: "Tokens rotated successfully",
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Token rotation failed: " + error.message,
    });
  }
};

module.exports = {
  testAdmin,
  loginController,
  logoutController,
  createAdminController,
  removeAdminController,
  resetAdminPasswordController,
  getAllAdmins,
  rotateRefreshToken,
};
