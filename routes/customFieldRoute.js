const express = require("express");
const router = express.Router();
const controller = require("../controller/customFieldController");
const { verifyToken } = require("../middleware/auth");
const verifyCSRF = require("../middleware/csrfCheck");

router.get("/", controller.getFields);
router.post("/:id", verifyCSRF, verifyToken, controller.createField);
router.delete("/:id", verifyCSRF, verifyToken, controller.deleteField);

module.exports = router;
