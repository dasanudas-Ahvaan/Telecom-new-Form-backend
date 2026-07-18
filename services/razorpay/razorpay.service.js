const razorpay = require("../../config/razorpay");
const Order = require("../../models/razorpay/Order.model");
const Payment = require("../../models/razorpay/Payment.model");
const mongoose = require("mongoose");
const verifySignature = require("../../utils/verifySignature.utils");

const razorpayService = async (data) => {
  return await razorpay.orders.create(data);
};

const createOrderInRazorPayAndDB = async (amount, receipt) => {
  console.log("amount donate", amount);

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
        amount: existingOrder.amount,
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
    console.log("order ", order, "and razor", razorpayOrder);

    return { order, razorpayOrder };
  } catch (err) {
    // Duplicate receipt due to race condition
    if (err.code === 11000) {
      const order = await Order.findOne({ receipt });

      return {
        order,
        razorpayOrder: {
          id: order.razorpayOrderId,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt,
        },
      };
    }

    throw err.message;
  }
};

const paymentCallback = async (
  razorpay_order_id,
  razorpay_payment_id,
  status,
  webhook_signature,
  entireBody,
  rawBody,
) => {
  const session = await mongoose.startSession();
  try {
    const valid = verifySignature(rawBody, webhook_signature);

    if (!valid) {
      throw new Error("Invalid Signature");
    }

    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!order) {
      throw new Error("Order not found");
    }
    //idempotency guard
    if (order.status === "success" || order.status === "failed") {
      return { success: true, message: "Already processed" };
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
              razorpaySignature: webhook_signature,
              status: status,
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
        },
        {
          $set: {
            status: status === "captured" ? "success" : "failed",
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

    return {
      success: true,
      message: "Payment processed",
      data: { status: status },
    };
  } catch (err) {
    if (err.message === "PAYMENT_ALREADY_PROCESSED") {
      return {
        success: true,
        message: "Payment already processed",
        data: { status: status },
      };
    }

    throw err;
  } finally {
    session.endSession();
  }
};
module.exports = { createOrderInRazorPayAndDB, paymentCallback };
