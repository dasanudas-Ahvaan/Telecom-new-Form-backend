const {
  createOrderInRazorPayAndDB,
  paymentCallback,
} = require("../services/razorpay/razorpay.service");

const createOrder = async (req, res) => {
  try {
    const { amount, receipt } = req.body;

    const { order, razorpayOrder } = await createOrderInRazorPayAndDB(
      amount,
      receipt,
    );

    res.status(200).json({
      success: true,
      data: { order, razorpayOrder },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const razorpayCallback = async (req, res) => {
  try {
    const rawBody = req.body;
    const webhook_signature = req.headers["x-razorpay-signature"];

    const parsedBody = JSON.parse(rawBody.toString());
    const {
      id: razorpay_payment_id,
      order_id: razorpay_order_id,
      status,
    } = parsedBody.payload.payment.entity;


    const callbackResponse = await paymentCallback(
      razorpay_order_id,
      razorpay_payment_id,
      status,
      webhook_signature,
      parsedBody,
      rawBody
    );

    const { success, message } = callbackResponse;

    return res.status(200).json({
      success,
      message,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = { createOrder, razorpayCallback };
