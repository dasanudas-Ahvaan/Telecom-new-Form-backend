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

    // Fast-exit idempotency guard: check if order is already settled
    if (order.status === "success" || order.status === "failed") {
      return { success: true, message: "Already processed" };
    }

    await session.withTransaction(async () => {
      // 1. Idempotency Check for Payment via Find-Before-Create
      if (razorpay_payment_id) {
        const existingPayment = await Payment.findOne({
          razorpayPaymentId: razorpay_payment_id,
        }).session(session);

        if (!existingPayment) {
          await Payment.create(
            [
              {
                orderId: order._id.toString(),
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: webhook_signature,
                status: status,
                payload: entireBody,
              },
            ],
            { session },
          );
        }
      }

      // 2. Re-fetch order inside transaction with a lock/check to prevent race conditions
      const currentOrder = await Order.findOne({ _id: order._id }).session(
        session,
      );

      const statusHierarchy = {
        created: 1,
        failed: 2,
        success: 3,
      };

      const incomingStatusWeight =
        statusHierarchy[status === "captured" ? "success" : "failed"] || 0;
      const currentStatusWeight = statusHierarchy[currentOrder.status] || 0;

      // Only update if incoming status weight is higher or if it's an explicit valid state transition
      if (incomingStatusWeight >= currentStatusWeight) {
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
      }

      // ---------------------------
      // Put your business logic here
      //
      // send email
      // generate invoice
      // etc.
      // ---------------------------
    });

    return {
      success: true,
      message: "Payment processed check status for confirmation",
      data: { status: status },
    };
  } catch (err) {
    if (err.code === 11000 || err.message === "PAYMENT_ALREADY_PROCESSED") {
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
