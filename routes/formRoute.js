const express = require("express");
const router = express.Router();
const { 
    testController, 
    getAllMembers, 
    createMember, 
    deleteMember, // यदि आपने इसे पहले जोड़ा है
    updateMember // अब इसे जोड़ें
} = require("../controller/formCrud.js");

// Test route
router.get("/test", testController);

// Get all members
router.get("/members", getAllMembers);

// Create a new member
router.post("/members", createMember);

// Member ko ID se delete karne ke liye

router.delete("/members/:id", deleteMember); 

// Member को ID से अपडेट करने के लिए


router.put("/members/:id", updateMember); 
// Base route
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Jai Shri Ram!, you are inside the form router",
  });
});

module.exports = router;