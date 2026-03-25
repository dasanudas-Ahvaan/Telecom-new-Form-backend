const { Admin } = require("../../models/adminSchema");

const createAdmin = async (name, email, password) => {
  try {
    if (!email || !name || !password) {
      throw new Error("Missing credentials");
    }
    
    if (password.length < 8) {
      throw new Error(
        "Password length must be greater than or equal to 8 characters",
      );
    }
    let adminExists = await Admin.findOne({ email });
    if (adminExists) {
      throw new Error("Admin already exists");
    }
    let admin = await Admin.create({
      email,
      password,
      name,
      role: "admin",
    });
    let adminObj = admin.toObject();
    delete adminObj.password;
    delete adminObj.role;
    delete adminObj._id;
    delete adminObj.createdAt;
    delete adminObj.updatedAt;
    delete adminObj.__v;

    return {
      response: {
        success: true,
        message: "Admin user created",
        data: adminObj,
      },
      metadata: `New admin with email ${admin.email} and name ${admin.name} was created`,
      after: adminObj,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = createAdmin;
