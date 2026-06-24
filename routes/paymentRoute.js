const express = require("express");
const router = express.Router();

const {
  createPayment,
  checkStatus,
  verifyPayment
} = require("../controller/paymentController");

router.post("/pay", createPayment);
router.get("/status/:txnId", checkStatus);
router.post("/verify", verifyPayment);

module.exports = router;