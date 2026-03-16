const { Admin } = require("../models/adminSchema.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../middleware/auth.js");
const { validateSuperUser } = require("../middleware/superUserValidator.js");

const testAdmin = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin Controller",
  });
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(401).json({ success: false, message: "Missing email" });
    } else if (!password) {
      return res
        .status(401)
        .json({ success: false, message: "Missing password" });
    }
    const user = await Admin.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const isMatch = bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Credentials" });
    }
    const token = generateToken(user);
    let userObj = user.toObject();
    delete userObj.password;
    delete userObj.email;
    delete userObj.createdAt;
    delete userObj.updatedAt;
    delete userObj.__v;
    return res.status(200).json({
      success: !false,
      token,
      message: "Logged in successfully",
      data: userObj,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error while logging in",
      error: error,
    });
  }
};

const createAdmin = async (req, res) => {
  try {
    const accessError = validateSuperUser(req, res);
    if (accessError) return;
    const { email, password } = req.body;
    if (!email) {
      return res.status(401).json({ success: false, message: "Missing email" });
    } else if (!password) {
      return res
        .status(401)
        .json({ success: false, message: "Missing password" });
    }
    let user = await Admin.findOne({ email });
    if (user) {
      return res.status(409).json({
        success: false,
        message: "User alreay exists with this email",
      });
    } else {
      user = await Admin.create({
        email,
        password,
        role: "admin",
      });
    }
    let userObj = user.toObject();
    delete userObj.password;
    delete userObj.role;
    delete userObj._id;
    delete userObj.createdAt;
    delete userObj.updatedAt;
    delete userObj.__v;
    return res
      .status(200)
      .json({ success: true, message: "Admin user created", data: userObj });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error while creating admin",
      error: error?.message,
    });
  }
};

const removeAdmin = async (req, res) => {
  try {
    const accessError = validateSuperUser(req, res);
    if (accessError) return;

    const { adminId } = req.params;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Admin ID is required",
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (admin.email === req.user.email) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove yourself",
      });
    }

    await Admin.findByIdAndDelete(adminId);

    return res.status(200).json({
      success: true,
      message: "Admin removed successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error while removing admin",
      error: error?.message,
    });
  }
};

const resetAdminPassword = async (req, res) => {
  try {
    const accessError = validateSuperUser(req, res);
    if (accessError) return;

    const { adminId, newPassword } = req.body;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Admin ID is required",
      });
    }

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    admin.password = newPassword;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error while resetting password",
      error: error?.message,
    });
  }
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
  login,
  createAdmin,
  removeAdmin,
  resetAdminPassword,
  getAllAdmins,
};
