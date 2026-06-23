const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  merchantTransactionId: String,
  amount: Number,
  status: {
    type: String,
    default: "PENDING"
  },
  userId: String,
  phonepeResponse: Object
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);