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
    const { token, data } = await login(email, password);
    const csrfToken = crypto.randomBytes(32).toString("hex");
    res.cookie("token", token, {
      httpOnly: environment === "production", // Prevents XSS (JavaScript cannot read this)
      secure: environment === "production", // Only sent over HTTPS (use false for local dev)
      sameSite: "Strict", // Prevents CSRF
      maxAge: 1000 * 60 * 60, // 1 hour in milliseconds
    });
    res.cookie("XSRF-TOKEN", csrfToken, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 1000 * 60 * 60,
    });
    return res
      .status(200)
      .json(
        successJsonResponse(true, "Logged in successfully", data),
      );
  } catch (error) {
    if (
      error.message === "Invalid user credentials" ||
      error.message === "Missing email" ||
      error.message === "Missing password"
    )
      return res.status(401).json(unauthorizedJsonResponse(error.message));
    else if (error.message === "User not found")
      return res.status(404).json(notFoundJsonResponse(error.message));
    else return res.json(internalErrorJsonResponse(error.message));
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
  const accessError = validateSuperUser(req, res);
  if (accessError) return;
  const { name, email, password } = req.body;
  const response = await createAdmin(name, email, password);

  return response;
};

const removeAdminController = async (req, res) => {
  const accessError = validateSuperUser(req, res);
  if (accessError) return;

  const { adminId } = req.params;
  const { email: userEmail } = req.user;

  const result = await removeAdmin(adminId, userEmail);

  return result;
};

// const removeAdminController = async (req, res) => {
//   try {
//     const accessError = validateSuperUser(req, res);
//     if (accessError) return;

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
  const accessError = validateSuperUser(req, res);
  if (accessError) return;

  const { adminId, newPassword } = req.body;
  const userEmail = req.user.email;

  const response = await resetPassword(adminId, newPassword, userEmail);

  return response;
};

const getAllAdmins = async (req, res) => {
  try {
    const accessError = validateSuperUser(req, res);
    if (accessError) return;

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
module.exports = {
  testAdmin,
  loginController,
  logoutController,
  createAdminController,
  removeAdminController,
  resetAdminPasswordController,
  getAllAdmins,
};
