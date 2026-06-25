const express = require("express");
const router = express.Router();
const formRouter = require("./formRoute");
const adminRouter = require("./adminRoute");
const yuSanskarRouter = require("./yuSanskarRoute");

router.use("/form", formRouter);
router.use("/auth", adminRouter);
router.use("/yu-sanskar", yuSanskarRouter);

module.exports = router;
