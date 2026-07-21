import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
      index: true,
    },

    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },

    razorpaySubscriptionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    razorpayPlanId: {
      type: String,
      required: true,
    },

    razorpayCustomerId: {
      type: String,
    },

    status: {
      type: String,
      enum: [
        "created",
        "authenticated",
        "active",
        "pending",
        "halted",
        "cancelled",
        "completed",
        "expired",
      ],
      default: "created",
    },

    quantity: {
      type: Number,
      default: 1,
    },

    totalCount: {
      type: Number,
      required: true,
    },

    paidCount: {
      type: Number,
      default: 0,
    },

    remainingCount: {
      type: Number,
    },

    customerNotify: {
      type: Boolean,
      default: true,
    },

    currentStart: Date,

    currentEnd: Date,

    startAt: Date,

    endAt: Date,

    chargeAt: Date,

    expireBy: Date,

    endedAt: Date,

    shortUrl: String,

    authAttempts: {
      type: Number,
      default: 0,
    },

    hasScheduledChanges: {
      type: Boolean,
      default: false,
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

export default mongoose.model("Subscription", subscriptionSchema);