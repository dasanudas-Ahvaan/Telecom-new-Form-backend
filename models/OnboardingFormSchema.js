const mongoose = require("mongoose");
const {
  VolunteerProgramResponseSchema,
} = require("./VolunteerProgramResponseSchema.model");

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
    paymentType: {
      donationType: {
        type: String,
        enum: ["once", "recurring", "free"],
        default: "free",
      },
      razorpayOrderId: {
        type: String,
        required: false,
      },
      razorpayPaymentId: {
        type: String,
        required: false,
      },
      razorpaySubscriptionId: {
        type: String,
        required: false,
      },
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
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
    volunteerPrograms: {
      type: [VolunteerProgramResponseSchema],
      default: [],
    },
    aadhar: {
      type: String,
      trim: true,
      match: /^\d{12}$/,
      required: true,
    },
    extraFields: {
      type: mongoose.Schema.Types.Mixed,
      validate: {
        validator: (v) => typeof v === "object" && !Array.isArray(v),
        message: "extraFields must be an object",
      },
    },
  },
  {
    _id: false,
    timestamps: true,
  },
);

const Member = mongoose.model("Member", OnboardingFormSchema);
module.exports = { Member };
