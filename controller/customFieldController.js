const { CustomField } = require("../models/CustomFieldSchema");
const { validateSuperUser } = require("../middleware/superUserValidator");
const xss = require("xss");
const mongoose = require("mongoose");


exports.getFields = async (req, res) => {
  const fields = await CustomField.find();
  res
    .status(200)
    .json({ successs: true, data: fields, message: "Custom Fields fetched" });
};

exports.createField = async (req, res) => {
  try {
    const accessError = validateSuperUser(req, res);
    if (accessError) return;
    const { label, type, required, options } = req.body;
    if (!label || !type) {
      return res.status(401).json({ message: "Label and type are required" });
    }
    if (
      type === "select" &&
      (!options || !Array.isArray(options) || options.length === 0)
    ) {
      return res
        .status(401)
        .json({ message: "Options are required for select type" });
    }
    const fieldData = {
      label: xss(label),
      type, // Mongoose Enum will catch if this is invalid
      required: Boolean(required),
      options: type === "select" ? options.map((o) => xss(String(o))) : [],
    };

    let field = await CustomField.create(fieldData);
    let userObj = field.toObject();
    return res.status(201).json({
      success: true,
      message: "Field created successfully",
      data: userObj,
    });
  } catch (error) {
    console.error("Error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({
      success: false,
      message: "Error while creating field",
      error: error?.message,
    });
  }
};

exports.deleteField = async (req, res) => {
  try {
    const accessError = validateSuperUser(req, res);
    if (accessError) return;
    const fieldId = req.query.fieldId;
    if (!mongoose.Types.ObjectId.isValid(fieldId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format. Please provide a valid ObjectId.",
      });
    }
    const deletedField = await CustomField.findOneAndDelete({ _id: fieldId });
    if (!deletedField) {
      return res
        .status(404)
        .json({ success: false, message: "Field not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Field deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error while deleting field",
      error: error?.message,
    });
  }
};
