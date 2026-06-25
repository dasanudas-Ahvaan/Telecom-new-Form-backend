const mongoose = require("mongoose");

const yuSanskarSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      //   unique : true ,
      index: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    fatherName: {
      type: String,
      required: true,
      trim: true,
    },

    varna: {
      type: String,
      required: true,
      enum: ["ब्राह्मण", "क्षत्रिय", "वैश्य"],
    },

    motherVarna: {
      type: String,
      required: true,
      enum: ["ब्राह्मण", "क्षत्रिय", "वैश्य"],
    },

    gotra: {
      type: String,
      required: true,
      trim: true,
    },

    motherGotra: {
      type: String,
      required: true,
      trim: true,
    },

    age: {
      type: Number,
      required: true,
      min: 1,
    },

    address: {
      type: String,
      required: true,
    },

    nativePlace: {
      type: String,
      default: "",
    },

    isUpaneet: {
      type: String,
      required: true,
      enum: ["हाँ", "नहीं"],
    },

    fatherUpanayanDone: {
      type: String,
      required: true,
      enum: ["हाँ", "नहीं"],
    },

    fatherSandhya: {
      type: String,
      required: true,
      enum: ["हाँ", "नहीं", "अप्रासंगिक"],
    },

    generationDetails: {
      type: String,
      required: true,
    },

    fatherUpanayanAge: {
      type: String,
      required: true,
      enum: [
        "अप्रासंगिक",
        "5-12 वर्ष की आयु के मध्य",
        "12-16 वर्ष की आयु के मध्य",
        "16-22 वर्ष की आयु के मध्य",
        "22-24 वर्ष की आयु के मध्य",
        "24 वर्ष के उपरान्त",
      ],
    },

    underAcharyaRamshankar: {
      type: String,
      required: true,
      enum: ["हाँ", "नहीं", "अप्रासंगिक"],
    },

    acharyaDetails: {
      type: String,
      required: true,
    },

    mobileNumber: {
      type: String,
      required: true,
    },

    additionalInfo: {
      type: String,
      default: "",
    },

    aadhaarPhoto: {
      type: String, // Cloudinary URL ya local file path
      required: true,
    },

    aadhaarNumber: {
      type: String,
      required: true,
    },

    aadhaarLinkedMobile: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("YuSanskar", yuSanskarSchema);
