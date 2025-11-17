const express = require("express");
const router = express.Router();

const {
  testController,
  getAllMembers,
  createMember,
  deleteMember,
  updateMember,
  getMemberById,
  
  
} = require("../controller/formCrud.js");

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚩 Jai Shri Ram!",
  });
});

router.get("/test", testController);

router
  .route("/members")
  .post(createMember); 

// router
//   .route("/members/:id")
//   .get(getMemberById) 
//   .delete(deleteMember) 
//   .put(updateMember);

module.exports = router;
