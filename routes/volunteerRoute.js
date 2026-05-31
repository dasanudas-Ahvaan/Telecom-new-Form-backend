const router = require("express").Router();

const {
  createVolunteerProgram,
  getVolunteerPrograms,
  getVolunteerProgramById,
  updateVolunteerProgram,
  deactivateVolunteerProgram,
} = require("../controller/volunteerController");

router.post("/", createVolunteerProgram);

router.get("/", getVolunteerPrograms);

router.get("/:id", getVolunteerProgramById);

router.put("/:id", updateVolunteerProgram);

module.exports = router;