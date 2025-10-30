const express = require("express");
const router = express.Router();
const formRouter = require("./formRoute");

router.use("/form", formRouter);

module.exports = router;
