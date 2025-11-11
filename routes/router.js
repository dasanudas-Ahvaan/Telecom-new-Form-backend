const express = require("express");
const router = express.Router();
const formRouter = require("./formRoute");
const adminRouter = require("./adminRoute");

router.use("/form", formRouter);
router.use("/auth", adminRouter);

module.exports = router;
