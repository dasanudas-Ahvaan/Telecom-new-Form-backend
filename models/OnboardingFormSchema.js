// models/Member.js
const mongoose = require("mongoose");
const Counter = require("../models/counter.js"); // <-- Counter model import kar rahe hain

// 🔹 Onboarding Form Schema (Custom ID ke sath)
const OnboardingFormSchema = new mongoose.Schema(
  {
    // 🔸 Custom ID field (ObjectId ke jagah hum apna ID use karenge)
    _id: {
      type: String,
    },

    // 🔸 Member details
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
      match: /^[a-zA-Z\s]+$/, // sirf alphabets aur space allow
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      match: /^\S+@\S+\.\S+$/, // basic email format validation
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: /^\d{10}$/, // 10 digit number hona chahiye
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
      set: (arr) => arr.map((item) => item.trim()), // har item trim hoke store hoga
    },
  },
  {
    _id: false, // <-- Default ObjectId disable kar diya (kyunki hum custom ID bana rahe hain)
    timestamps: true, // createdAt aur updatedAt automatic milenge
  }
);

// 🔹 Pre-save hook: Custom ID generate karne ka logic
OnboardingFormSchema.pre("save", async function (next) {
  const doc = this;

  // Ye logic sirf tab chalega jab naya document create ho raha ho
  if (!doc.isNew) {
    return next();
  }

  try {
    // 1️⃣ Counter collection me 'member_id' record ka sequence +1 karte hain
    const counter = await Counter.findByIdAndUpdate(
      { _id: "member_id" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true } // agar record nahi mila to bana do
    );

    // 2️⃣ Sequence number ko 5 digits me pad karte hain (e.g., 00001)
    const paddedId = String(counter.seq).padStart(5, "0");

    // 3️⃣ Custom ID assign karte hain (e.g., AHVN00001)
    doc._id = "AHVN" + paddedId;

    next();
  } catch (error) {
    console.error("❌ Custom ID generation failed:", error);
    next(error);
  }
});

// 🔹 Model export kar rahe hain
const Member = mongoose.model("Member", OnboardingFormSchema);
module.exports = { Member };
