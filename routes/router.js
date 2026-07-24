const express = require("express");
const router = express.Router();
const formRouter = require("./formRoute");
const dashboardRouter = require("./dashboardRoute");
const adminRouter = require("./adminRoute");
const customFieldRouter = require("./customFieldRoute");
const volunteerRouter = require("./volunteerRoute");
const razorPayRouter = require("./razorpay.route");
const subscriptionRouter = require("./subscription.route");

router.use("/form", formRouter);
router.use("/auth", dashboardRouter);
router.use("/admin", adminRouter);
router.use("/custom-field", customFieldRouter);
router.use("/volunteer", volunteerRouter);
router.use("/pay", razorPayRouter);
router.use("/subscribe", subscriptionRouter);

module.exports = router;
