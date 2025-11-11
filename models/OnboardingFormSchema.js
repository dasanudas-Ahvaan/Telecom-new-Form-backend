const mongoose = require("mongoose");
const Counter = require("../models/counter.js");

const OnboardingFormSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "inactive"],
      default: "active",
    },
    isVerified: {
      type: Boolean,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
      match: /^[a-zA-Z\s]+$/,
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
      match: /^\d{10}$/,
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
    aadhar: {
      type: String,
      trim: true,
      match: /^\d{12}$/,
    },
    extraFields: {
      type: Schema.Types.Mixed,
      validate: {
        validator: (v) => typeof v === "object" && !Array.isArray(v),
        message: "extraFields must be an object",
      },
    },
  },
  {
    _id: false,
    timestamps: true,
  }
);

OnboardingFormSchema.pre("save", async function (next) {
  const doc = this;

  if (!doc.isNew) {
    return next();
  }

  try {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "member_id" },
      { $inc: { seq: 1 }, $setOnInsert: { collectionName: "members" } },
      { new: true, upsert: true }
    );

    const paddedId = String(counter.seq).padStart(5, "0");

    doc._id = "AHVN" + paddedId;

    next();
  } catch (error) {
    console.error("Custom ID generation failed:", error);
    next(error);
  }
});

const Member = mongoose.model("Member", OnboardingFormSchema);
module.exports = { Member };
