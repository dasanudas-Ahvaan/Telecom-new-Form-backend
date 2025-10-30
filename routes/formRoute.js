const express = require("express");
const router = express.Router();
const { testController, getAllMembers, createMember } = require("../controller/formCrud.js");

// Test route
router.get("/test", testController);

// Get all members
router.get("/members", getAllMembers);

// Create a new member
router.post("/members", createMember);

// Base route
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Jai Shri Ram!, you are inside the form router",
  });
});

module.exports = router;