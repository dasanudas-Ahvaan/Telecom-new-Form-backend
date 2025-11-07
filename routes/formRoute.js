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

// --- Generic Form Submission Route ---
router.post("/form", submitForm);

// --- Member CRUD Routes ---
router
  .route("/members")
  .get(getAllMembers) 
  .post(createMember); 

router
  .route("/members/:id")
  .delete(deleteMember) // Delete by ID
  .put(updateMember); // Update by ID

module.exports = router;
