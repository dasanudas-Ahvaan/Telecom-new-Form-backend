const express = require("express");
const router = express.Router();

// --- Controllers Import ---
const {
  testController,
  getAllMembers,
  createMember,
  deleteMember,
  updateMember,
  submitForm, // handles generic form submission + email reply
} = require("../controller/formCrud.js");

// --- Base Route ---
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚩 Jai Shri Ram!",
  });
});

// --- Test Route ---
router.get("/test", testController);

// --- General Form Submission Route ---
// ✅ This sends email reply after user submits form
router.post("/form", submitForm);

// --- Member CRUD Routes ---
router
  .route("/members")
  .get(getAllMembers) // Get all members
  .post(createMember); // Add new member + send welcome email

router
  .route("/members/:id")
  .delete(deleteMember) // Delete by ID
  .put(updateMember); // Update by ID

module.exports = router;
