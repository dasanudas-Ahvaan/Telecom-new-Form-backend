import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true, // in paise
    },

    currency: {
      type: String,
      default: "INR",
    },

    period: {
      type: String,
      enum: ["daily", "weekly", "monthly", "quarterly", "yearly"],
      required: true,
    },

    interval: {
      type: Number,
      default: 1,
    },

    razorpayPlanId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    razorpayItemId: {
      type: String,
    },

    features: [
      {
        type: String,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },

    notes: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Plan", planSchema);