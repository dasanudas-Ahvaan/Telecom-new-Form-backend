const razorpay = require("../../config/razorpay");
const Order = require("../../models/razorpay/Order.model");
const Payment = require("../../models/razorpay/Payment.model");
const mongoose = require("mongoose");
const verifySignature = require("../../utils/verifySignature.utils");

const razorpayService = async (data) => {
  return await razorpay.orders.create(data);
};

const createOrderInRazorPayAndDB = async (amount, receipt) => {
  if (!amount || amount < 1) {
    throw new Error("invalid amount");
  }
  if (!receipt) {
    throw new Error("missing receipt");
  }
  const existingOrder = await Order.findOne({
    receipt,
    status: { $in: ["created", "attempted", "paid"] },
  });

  if (existingOrder) {
    return {
      order: existingOrder,
      razorpayOrder: {
        id: existingOrder.razorpayOrderId,
        amount: existingOrder.amount * 100,
        currency: existingOrder.currency,
        receipt: existingOrder.receipt,
      },
    };
  }
  const razorpayOrder = await razorpayService({
    amount: amount * 100,
    currency: "INR",
    receipt,
  });
  if (!razorpayOrder) {
    throw new Error("Error faced during razorpay order creation");
  }
  try {
    const order = await Order.create({
      amount,
      currency: "INR",
      receipt,
      razorpayOrderId: razorpayOrder.id,
    });

    if (!order) {
      throw new Error("Error faced during order submission");
    }

    return { order, razorpayOrder };
  } catch (err) {
    // Duplicate receipt due to race condition
    if (err.code === 11000) {
      const order = await Order.findOne({ receipt });

      return {
        order,
        razorpayOrder: {
          id: order.razorpayOrderId,
          amount: order.amount * 100,
          currency: order.currency,
          receipt: order.receipt,
        },
      };
    }

    throw err.message;
  }
};

// const paymentCallback = async (
//   razorpay_order_id,
//   razorpay_payment_id,
//   razorpay_signature,
//   entireBody,
// ) => {
//   try {
//     const valid = verifySignature(
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//     );
//     const order = await Order.findOne({
//       razorpayOrderId: razorpay_order_id,
//     });

//     if (!order) {
//       throw new Error("Order not found");
//     }
//     const existingPayment = await Payment.findOne({
//       razorpayPaymentId: razorpay_payment_id,
//     });
//     if (existingPayment) {
//       const { status } = existingPayment;

//       return status === "paid"
//         ? { success: true, message: "payment already processed" }
//         : { success: false, message: "payment failed" };
//     }
//     if (!valid) {
//       order.status = "failed";

//       await order.save();

//       await Payment.create({
//         orderId: order._id,
//         razorpayOrderId: razorpay_order_id,
//         razorpayPaymentId: razorpay_payment_id,
//         razorpaySignature: razorpay_signature,
//         status: "failed",
//         payload: entireBody,
//       });

//       throw new Error("Invalid Signature");
//     }
//     order.status = "paid";

//     await order.save();

//     await Payment.create({
//       orderId: order._id,
//       razorpayOrderId: razorpay_order_id,
//       razorpayPaymentId: razorpay_payment_id,
//       razorpaySignature: razorpay_signature,
//       status: "paid",
//       payload: entireBody,
//     });
//     return { success: true, message: "Payment processed" };
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

const paymentCallback = async (
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  entireBody,
) => {
  const session = await mongoose.startSession();

  try {
    const valid = verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );

    if (!valid) {
      throw new Error("Invalid Signature");
    }

    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!order) {
      throw new Error("Order not found");
    }

    await session.withTransaction(async () => {
      try {
        // If duplicate payment arrives this insert will fail
        await Payment.create(
          [
            {
              orderId: order._id,
              razorpayOrderId: razorpay_order_id,
              razorpayPaymentId: razorpay_payment_id,
              razorpaySignature: razorpay_signature,
              status: "paid",
              payload: entireBody,
            },
          ],
          { session },
        );
      } catch (err) {
        if (err.code === 11000) {
          // Already processed
          throw new Error("PAYMENT_ALREADY_PROCESSED");
        }

        throw err;
      }

      await Order.updateOne(
        {
          _id: order._id,
          status: { $ne: "paid" },
        },
        {
          $set: {
            status: "paid",
          },
        },
        {
          session,
        },
      );

      // ---------------------------
      // Put your business logic here
      //
      // create subscription
      // send email
      // generate invoice
      // etc.
      // ---------------------------
    });

    session.endSession();

    return {
      success: true,
      message: "Payment processed",
    };
  } catch (err) {
    session.endSession();

    if (err.message === "PAYMENT_ALREADY_PROCESSED") {
      return {
        success: true,
        message: "Payment already processed",
      };
    }

    if (err.message === "Invalid Signature") {
      await Order.updateOne(
        {
          razorpayOrderId: razorpay_order_id,
        },
        {
          $set: {
            status: "failed",
          },
        },
      );

      try {
        await Payment.create({
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          status: "failed",
          payload: entireBody,
        });
      } catch (_) {
        // Ignore duplicate failed callback
      }
    }

    throw err;
  }
};
module.exports = { createOrderInRazorPayAndDB, paymentCallback };
