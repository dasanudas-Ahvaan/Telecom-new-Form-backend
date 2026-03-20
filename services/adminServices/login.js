const bcrypt = require("bcrypt");
const { Admin } = require("../../models/adminSchema");
const { generateToken } = require("../../middleware/auth");

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
    let userObj = user.toObject();
    delete userObj.password;
    delete userObj.email;
    delete userObj.createdAt;
    delete userObj.updatedAt;
    delete userObj.__v;

    return { token, data: userObj };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = login;
