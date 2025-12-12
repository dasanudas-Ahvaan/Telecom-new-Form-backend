const mongoose = require("mongoose");

const CustomFieldSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ["text", "number", "email", "date", "select", "checkbox"],
      required: true,
    },
    required: { type: Boolean, default: false },
    options: [{ type: String }], // only for select data type
  },
  { timestamps: true }
);
const CustomField = mongoose.model("CustomField", CustomFieldSchema);

module.exports = { CustomField };
