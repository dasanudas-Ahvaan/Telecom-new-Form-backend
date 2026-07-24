// controllers/subscription.controller.js

const Plan = require("../models/razorpay/Plan.model.js");
const subscriptionService = require("../services/razorpay/subscription.service.js");

class SubscriptionController {
  async createPlan(req, res) {
    try {
      const plan = await subscriptionService.createPlan(req.body);

      return res.status(201).json({
        success: true,
        data: plan,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  async createSubscription(req, res) {
    try {
      const { planId } = req.body;
      if (!planId) {
        return res.status(404).json({
          success: false,
          message: "PlanId Missing",
        });
      }
      const plan = await Plan.findOne({ razorpayPlanId: planId });

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: "Plan not found",
        });
      }

      const subscription = await subscriptionService.createSubscription(planId);

      return res.status(201).json({
        success: true,
        data: {
          subscriptionId: subscription.razorpaySubscriptionId,

          shortUrl: subscription.shortUrl,

          subscription,
        },
      });
    } catch (err) {
      console.error(err);

      return res.status(500).json({
        success: false,

        message: err.message,
      });
    }
  }

  async fetchAllPlans(req, res) {
    try {
      const plan = await subscriptionService.fetchAllPlans();

      return res.status(201).json({
        success: true,
        data: plan,
        message: `total plans fetched ${plan.length}`,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
}

module.exports = new SubscriptionController();
