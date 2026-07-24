const subscriptionController = require("../controller/subscription.controller");

const router = require("express").Router();


/**
 * Create Subscription
 * POST /api/subscriptions
 */
router.post("/", subscriptionController.createSubscription);



/**
 * Create Razorpay Plan
 * POST /api/subscriptions/plans
 * (Usually Admin Only)
 */
router.post("/plans", subscriptionController.createPlan);
router.get("/plans", subscriptionController.fetchAllPlans);


module.exports = router;
