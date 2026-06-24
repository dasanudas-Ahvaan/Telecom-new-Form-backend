const Razorpay = require("razorpay");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const Payment = require("../models/paymentSchema");

// Initialize Razorpay SDK client
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createPayment = async (req, res) => {
  try {
    const { amount, userId, phone } = req.body;
    if (!amount || !userId) {
      return res.status(400).json({ success: false, message: "Amount and userId are required" });
    }

    const merchantTransactionId = "TXN" + uuidv4().replace(/-/g, "").substring(0, 18).toUpperCase();
    
    // Create Razorpay Order
    const options = {
      amount: Math.round(amount * 100), // Amount in paise
      currency: "INR",
      receipt: merchantTransactionId,
    };

    const order = await razorpay.orders.create(options);

    if (order && order.id) {
      await Payment.create({
        merchantTransactionId,
        razorpayOrderId: order.id,
        amount,
        status: "PENDING",
        userId,
        razorpayResponse: order
      });

      return res.status(200).json({
        success: true,
        keyId: process.env.RAZORPAY_KEY_ID,
        amount: amount,
        amountInPaise: order.amount,
        currency: order.currency,
        orderId: order.id,
        merchantTransactionId
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Razorpay Order creation failed",
        error: order
      });
    }
  } catch (error) {
    console.error("Error in createPayment:", error);
    const errorMessage = error.description || (error.error && error.error.description) || error.message || error;
    return res.status(500).json({
      success: false,
      message: "Internal server error during payment initiation",
      error: errorMessage
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, merchantTransactionId } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !merchantTransactionId) {
      return res.status(400).json({ success: false, message: "Missing required Razorpay signature parameters" });
    }

    // Verify signature
    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const payment = await Payment.findOneAndUpdate(
        { merchantTransactionId },
        {
          status: "SUCCESS",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        status: "SUCCESS",
        payment
      });
    } else {
      await Payment.findOneAndUpdate(
        { merchantTransactionId },
        { status: "FAILED" }
      );

      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Invalid signature."
      });
    }
  } catch (error) {
    console.error("Error in verifyPayment:", error);
    const errorMessage = error.description || (error.error && error.error.description) || error.message || error;
    return res.status(500).json({
      success: false,
      message: "Internal server error during verification",
      error: errorMessage
    });
  }
};

exports.checkStatus = async (req, res) => {
  try {
    const { txnId } = req.params;
    if (!txnId) {
      return res.status(400).json({ success: false, message: "Transaction ID is required" });
    }

    const payment = await Payment.findOne({ merchantTransactionId: txnId });
    if (!payment) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    // If status is PENDING, we can double-check with Razorpay API
    if (payment.status === "PENDING" && payment.razorpayOrderId) {
      try {
        const order = await razorpay.orders.fetch(payment.razorpayOrderId);
        if (order && order.status === "paid") {
          payment.status = "SUCCESS";
          payment.razorpayResponse = order;
          await payment.save();
        }
      } catch (err) {
        console.error("Error fetching order status from Razorpay:", err.message);
      }
    }

    return res.status(200).json({
      success: true,
      status: payment.status,
      data: {
        message: `Transaction status is ${payment.status}`,
        payment
      }
    });
  } catch (error) {
    console.error("Error in checkStatus:", error);
    const errorMessage = error.description || (error.error && error.error.description) || error.message || error;
    return res.status(500).json({
      success: false,
      message: "Internal server error during status check",
      error: errorMessage
    });
  }
};