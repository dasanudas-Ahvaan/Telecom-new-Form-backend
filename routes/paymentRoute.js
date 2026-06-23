const express = require("express");
const router = express.Router();

const {
 createPayment,
 checkStatus,
 phonepeCallback
} = require("../controller/paymentController");

router.post("/pay", createPayment);
router.get("/status/:txnId", checkStatus);
router.post("/callback", phonepeCallback);

module.exports = router;