const express = require("express");
const router = express.Router();
const formRouter = require("./formRoute");
const adminRouter = require("./adminRoute");
const customFieldRouter = require("./customFieldRoute");

router.use("/form", formRouter);
router.use("/auth", adminRouter);
router.use("/custom-field", customFieldRouter);

module.exports = router;
