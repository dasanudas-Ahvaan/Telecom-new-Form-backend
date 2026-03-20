const { Admin } = require("../../models/adminSchema");

const resetPassword = async (adminId, newPassword, userEmail) => {
  try {
    if (!adminId) {
      throw new Error("Missing credentials");
    }
    if (!newPassword || newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new Error("Not found");
    }
    admin.password = newPassword;
    await admin.save();
    return {
      response: { success: true, message: "Password reset successfully" },
      metadata: `password was reset for ${admin.email} by ${userEmail}`,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = resetPassword;
