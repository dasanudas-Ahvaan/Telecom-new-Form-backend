const VolunteerProgram = require("../models/VolunteerPrograms.model");

const createVolunteerProgram = async (req, res) => {
  try {
    const { id, title, description, pdfUrl, questions } = req.body;

    const exists = await VolunteerProgram.findById(id);

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Program already exists",
      });
    }

    const program = await VolunteerProgram.create({
      _id: id,
      title,
      description,
      pdfUrl,
      questions,
    });

    return res.status(201).json({
      success: true,
      data: program,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getVolunteerPrograms = async (req, res) => {
  try {
    const programs = await VolunteerProgram.find({
      active: true,
    }).sort({ title: 1 });

    return res.json({
      success: true,
      data: programs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getVolunteerProgramById = async (req, res) => {
  try {
    const program = await VolunteerProgram.findById(req.params.id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }

    return res.json({
      success: true,
      data: program,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateVolunteerProgram = async (req, res) => {
  try {
    const program = await VolunteerProgram.findById(req.params.id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }

    Object.assign(program, req.body);

    program.version += 1;

    await program.save();

    return res.json({
      success: true,
      data: program,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  createVolunteerProgram,
  getVolunteerPrograms,
  getVolunteerProgramById,
  updateVolunteerProgram,
};
