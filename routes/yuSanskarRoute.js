const express = require("express");

// console.log("Yu Sanskar Route Loaded");

const {
  testController,
  createYuSanskarForm,
  getAllYuSanskarForms,
  getYuSanskarFormById,
  updateYuSanskarForm,
  deleteYuSanskarForm,
} = require("../controller/yuSanskarController");

const { verifyToken } = require("../middleware/auth");

const router = express.Router();

router.get("/test", testController);

// Public route for form submission
router.post("/", createYuSanskarForm);

// Admin protected routes

/* router.get("/", verifyToken, getAllYuSanskarForms);

router
  .route("/:id")
  .get(verifyToken, getYuSanskarFormById)
  .put(verifyToken, updateYuSanskarForm)
  .delete(verifyToken, deleteYuSanskarForm); */

module.exports = router;
