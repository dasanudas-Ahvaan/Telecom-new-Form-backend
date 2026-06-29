const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },

    razorpayPaymentId: {
      type: String,
      unique: true,
      index: true,
      required: true,
    },

    razorpayOrderId: String,

    razorpaySignature: String,

    status: {
      type: String,
      enum: ["paid", "failed"],
    },

    payload: Object,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Payment", paymentSchema);
