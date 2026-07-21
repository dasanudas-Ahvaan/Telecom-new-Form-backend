const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: false,
    },
    Member: {
      type: String,
      required: false,
    },
    razorpayPaymentId: {
      type: String,
      unique: true,
      index: true,
      required: true,
    },
    razorpaySubscriptionId: String,
    razorpayOrderId: String,
    razorpayInvoiceId: String,
    razorpaySignature: String,

    status: {
      type: String,
      enum: ["captured", "failed"],
    },

    payload: Object,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Payment", paymentSchema);
