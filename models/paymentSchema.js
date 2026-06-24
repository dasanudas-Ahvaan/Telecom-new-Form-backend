const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  merchantTransactionId: String,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  amount: Number,
  status: {
    type: String,
    default: "PENDING"
  },
  userId: String,
  razorpayResponse: Object
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);