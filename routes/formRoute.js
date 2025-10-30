const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Jai Shri Ram!, you are inside the form router",
  });
});

module.exports = router;
