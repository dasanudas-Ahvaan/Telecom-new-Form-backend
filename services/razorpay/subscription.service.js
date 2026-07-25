const razorpay = require("../../config/razorpay.js");
const Plan = require("../../models/razorpay/Plan.model.js");
const Subscription = require("../../models/razorpay/Subscription.model.js");
const mongoose = require("mongoose");
const verifySignatureUtils = require("../../utils/verifySignature.utils.js");

class SubscriptionService {
  // =============================
  // Create Plan
  // =============================

  async createPlan(data) {
    const {
      name,
      description,
      amount,
      currency = "INR",
      period,
      interval = 1,
      features = [],
    } = data;

    try {
      const razorpayPlan = await razorpay.plans.create({
        period,
        interval,

        item: {
          name,
          description,
          amount: amount * 100,
          currency,
        },
      });

      const plan = await Plan.create({
        name,

        description,

        price: amount * 100,

        currency,

        period,

        interval,

        features,

        razorpayPlanId: razorpayPlan.id,

        razorpayItemId: razorpayPlan.item.id,
      });

      return plan;
    } catch (error) {
      throw error;
    }
  }

  // =============================
  // Create Subscription
  // =============================

  async createSubscription(planId) {
    const razorpaySubscription = await razorpay.subscriptions.create({
      plan_id: planId,

      total_count: 12,

      quantity: 1,

      customer_notify: true,
    });

    //updating in DB
    const subscription = await Subscription.create({
      razorpaySubscriptionId: razorpaySubscription.id,

      razorpayPlanId: planId,

      status: razorpaySubscription.status,

      totalCount: razorpaySubscription.total_count,

      remainingCount: razorpaySubscription.remaining_count,

      quantity: razorpaySubscription.quantity,

      customerNotify: razorpaySubscription.customer_notify,

      shortUrl: razorpaySubscription.short_url,

      chargeAt: razorpaySubscription.charge_at
        ? new Date(razorpaySubscription.charge_at * 1000)
        : null,

      startAt: razorpaySubscription.start_at
        ? new Date(razorpaySubscription.start_at * 1000)
        : null,

      expireBy: razorpaySubscription.expire_by
        ? new Date(razorpaySubscription.expire_by * 1000)
        : null,
    });

    return subscription;
  }

  async fetchAllPlans() {
    try {
      const plans = await razorpay.plans.all({ count: "100" });
      const sorted = plans.items.sort((a, b) => b.created_at - a.created_at);

      const seenAmounts = new Set();

      const items = sorted
        .filter((p) => {
          const amount = p.item.amount;
          if (seenAmounts.has(amount)) return false;
          seenAmounts.add(amount);
          return true;
        })
        .map((p) => ({
          id: p.id,
          amount: p.item.amount / 100,
        }));
      return items;
    } catch (error) {
      throw error;
    }
  }

  async subscriptionCallback(
    razorpay_order_id,
    razorpay_payment_id,
    status,
    webhook_signature,
    entireBody,
    rawBody,
  ) {
    const session = await mongoose.startSession();
    try {
      const valid = verifySignatureUtils(
        rawBody,
        webhook_signature,
        "subscription",
      );

      // if (!valid) {
      //   throw new Error("Invalid Signature");
      // }

      // const order = await Order.findOne({
      //   razorpayOrderId: razorpay_order_id,
      // });

      // if (!order) {
      //   throw new Error("Order not found");
      // }
      // //idempotency guard
      // if (order.status === "success" || order.status === "failed") {
      //   return { success: true, message: "Already processed" };
      // }
      // await session.withTransaction(async () => {
      //   try {
      //     // If duplicate payment arrives this insert will fail
      //     console.log("helol, iam here", {
      //       orderId: order._id.toString(),
      //       razorpayOrderId: razorpay_order_id,
      //       razorpayPaymentId: razorpay_payment_id,
      //       razorpaySignature: webhook_signature,
      //       status: status,
      //       payload: entireBody,
      //     });

      //     await Payment.create(
      //       [
      //         {
      //           orderId: order._id.toString(),
      //           razorpayOrderId: razorpay_order_id,
      //           razorpayPaymentId: razorpay_payment_id,
      //           razorpaySignature: webhook_signature,
      //           status: status,
      //           payload: entireBody,
      //         },
      //       ],
      //       { session },
      //     );
      //   } catch (err) {
      //     if (err.code === 11000) {
      //       // Already processed
      //       throw new Error("PAYMENT_ALREADY_PROCESSED");
      //     }

      //     throw err;
      //   }

      //   await Order.updateOne(
      //     {
      //       _id: order._id,
      //     },
      //     {
      //       $set: {
      //         status: status === "captured" ? "success" : "failed",
      //       },
      //     },
      //     {
      //       session,
      //     },
      //   );

      //   // ---------------------------
      //   // Put your business logic here
      //   //
      //   // create subscription
      //   // send email
      //   // generate invoice
      //   // etc.
      //   // ---------------------------
      // });

      return {
        success: true,
        message: "Signature validated",
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
  }
}

module.exports = new SubscriptionService();
