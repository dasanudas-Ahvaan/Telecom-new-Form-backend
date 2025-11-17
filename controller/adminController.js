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
    return res
      .status(200)
      .json({ success: true, message: "Admin user created", user: userObj });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error while creating admin",
      error: error?.message,
    });
  }
};

module.exports = { testAdmin, login, createAdmin };
