const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    receipt: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },

    amount: Number,

    currency: {
      type: String,
      default: "INR",
    },

    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    
    status: {
      type: String,
      enum: ["created", "success", "failed"],
      default: "created",
    },

    notes: Object,
    member: Object,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Order", orderSchema);
