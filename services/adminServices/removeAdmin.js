const { Admin } = require("../../models/adminSchema");

const removeAdmin = async (adminId, userEmail) => {
  try {
    if (!adminId) throw new Error("Missing credentials");
    const admin = await Admin.findById(adminId);
    if (!admin) throw new Error("Not found");
    if (admin.email === userEmail) throw new Error("Denied");
    await Admin.findByIdAndDelete(adminId);
    let userObj = admin.toObject();
    delete userObj.password;
    delete userObj.__v;
    return {
      response: {
        success: true,
        message: "Admin removed successfully",
      },
      before:userObj,
      metadata:`${userEmail} deleted ${admin.email}`
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = removeAdmin;
