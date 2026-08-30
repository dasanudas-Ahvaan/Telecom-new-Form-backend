const razorpay = require("../../config/razorpay.js");
const Plan = require("../../models/razorpay/Plan.model.js");
const Subscription = require("../../models/razorpay/Subscription.model.js");
const mongoose = require("mongoose");
const verifySignatureUtils = require("../../utils/verifySignature.utils.js");
const Payment = require("../../models/razorpay/Payment.model.js");

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

      total_count: 12*80, 

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

  async subscriptionCallback(webhook_signature, parsedBody, rawBody) {
    const session = await mongoose.startSession();
    try {
      const valid = verifySignatureUtils(
        rawBody,
        webhook_signature,
        "subscription",
      );

      if (!valid) {
        throw new Error("Invalid Signature");
      }

      const { event } = parsedBody;
      const subscription = parsedBody.payload.subscription.entity;
      const payment = parsedBody.payload.payment?.entity; // Optional chaining in case payment object is missing in some events

      await session.withTransaction(async () => {
        // 1. Idempotency Check for Payment
        if (
          payment &&
          (payment.status === "captured" || payment.status === "failed")
        ) {
          const existingPayment = await Payment.findOne({
            razorpayPaymentId: payment.id,
          }).session(session);

          if (!existingPayment) {
            await Payment.create(
              [
                {
                  razorpaySubscriptionId: subscription.id,
                  razorpayOrderId: payment.order_id,
                  razorpayPaymentId: payment.id,
                  razorpayInvoiceId: payment.invoice_id,
                  razorpaySignature: webhook_signature,
                  status: payment.status === "captured" ? "captured" : "failed",
                  MemberEmail: payment.email || subscription.customer_email,
                  payload: parsedBody,
                },
              ],
              { session },
            );
          }
        }

        // 2. Fetch current subscription to guard against out-of-order status regressions
        const existingSub = await Subscription.findOne({
          razorpaySubscriptionId: subscription.id,
        }).session(session);

        // Define status priority to avoid a 'halted' or 'pending' state overriding 'active' improperly
        const statusHierarchy = {
          created: 1,
          authenticated: 2,
          pending: 3,
          active: 4,
          halted: 5,
          completed: 6,
          cancelled: 7,
          expired: 8,
        };

        const incomingStatusWeight = statusHierarchy[subscription.status] || 0;
        const currentStatusWeight = existingSub
          ? statusHierarchy[existingSub.status] || 0
          : 0;

        // Construct update payload dynamically with all key subscription attributes
        const updateData = {
          status: subscription.status,
          razorpayCustomerId: subscription.customer_id,
          quantity: subscription.quantity,
          totalCount: subscription.total_count,
          paidCount: subscription.paid_count,
          remainingCount: subscription.remaining_count,
          customerNotify: subscription.customer_notify,
          authAttempts: subscription.auth_attempts,
          hasScheduledChanges: subscription.has_scheduled_changes,
          currentStart: subscription.current_start
            ? new Date(subscription.current_start * 1000)
            : null,
          currentEnd: subscription.current_end
            ? new Date(subscription.current_end * 1000)
            : null,
          startAt: subscription.start_at
            ? new Date(subscription.start_at * 1000)
            : null,
          endAt: subscription.end_at
            ? new Date(subscription.end_at * 1000)
            : null,
          chargeAt: subscription.charge_at
            ? new Date(subscription.charge_at * 1000)
            : null,
          expireBy: subscription.expire_by
            ? new Date(subscription.expire_by * 1000)
            : null,
          endedAt: subscription.ended_at
            ? new Date(subscription.ended_at * 1000)
            : null,
          shortUrl: subscription.short_url,
        };

        // Only update status if it progresses or if it's an explicit terminal status change
        if (
          incomingStatusWeight >= currentStatusWeight ||
          ["cancelled", "completed", "expired", "halted"].includes(
            subscription.status,
          )
        ) {
          await Subscription.updateOne(
            { razorpaySubscriptionId: subscription.id },
            { $set: updateData },
            { session, upsert: true }, // Upsert handles cases where sub creation record missed saving initially
          );
        } else {
          // If status shouldn't change backward, update metrics/counters anyway without changing status
          delete updateData.status;
          await Subscription.updateOne(
            { razorpaySubscriptionId: subscription.id },
            { $set: updateData },
            { session },
          );
        }
      });

      return {
        success: true,
        message: "Webhook processed successfully",
      };
    } catch (err) {
      if (err.code === 11000) {
        return {
          success: true,
          message: "Event already processed idempotently (Duplicate key)",
        };
      }
      throw err;
    } finally {
      session.endSession();
    }
  }
}

module.exports = new SubscriptionService();
