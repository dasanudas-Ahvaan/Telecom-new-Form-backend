const mongoose = require("mongoose");

const OnboardingFormSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
      match: /^[a-zA-Z\s]+$/, // only letters & spaces
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      match: /^\S+@\S+\.\S+$/,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: /^\d{10}$/, //Format: (e.g., 9855245639 for India 10 digits).
    },
    gender: {
      type: String,
      required: true,
      lowercase: true,
      enum: ["male", "female", "other"],
    },
    dateOfBirth: { type: Date, required: true },
    education: { type: String, required: true, trim: true },
    profession: { type: String, required: true, trim: true },
    addressLine1: { type: String, required: true, trim: true, maxlength: 200 },
    addressLine2: { type: String, trim: true, maxlength: 200 },
    pincode: { type: String, required: true, trim: true, match: /^\d{6}$/ },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: "India" },
    previousAssociations: { type: String, trim: true, default: "N.A" },
    volunteerPrograms: {
      type: [String],
      set: (arr) => arr.map((item) => item.trim()),
    },
  },
  { timestamps: true }
);

const Member = mongoose.model("Member", OnboardingFormSchema);

module.exports = { Member };
