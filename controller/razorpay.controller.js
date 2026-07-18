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
    const {
      id: razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;
    const entireBody = req.body;
    console.log("callback", JSON.stringify(entireBody));

    const callbackResponse = await paymentCallback(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      entireBody,
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
