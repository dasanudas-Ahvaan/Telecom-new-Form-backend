const {
  createOrder,
  razorpayCallback,
} = require("../controller/razorpay.controller");

const router = require("express").Router();

router.post("/", createOrder);
router.post("/callback", razorpayCallback);

module.exports = router;
