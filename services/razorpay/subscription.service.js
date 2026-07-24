const razorpay = require("../../config/razorpay.js");
const Plan = require("../../models/razorpay/Plan.model.js");
const Subscription = require("../../models/razorpay/Subscription.model.js");

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
}

module.exports = new SubscriptionService();
