const express = require("express");
const router = express.Router();
const controller = require("../controller/customFieldController");
const { verifyToken } = require("../middleware/auth");

router.get("/", controller.getFields);
router.post("/:id", verifyToken, controller.createField);
router.delete("/:id", verifyToken, controller.deleteField);

module.exports = router;
