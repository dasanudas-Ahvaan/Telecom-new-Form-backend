const { Member } = require("../models/OnboardingFormSchema.js");

// Test controller (for basic testing)
exports.testController = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Form controller is working properly ",
  });
};

// Get all members
exports.getAllMembers = async (req, res) => {
  try {
    const members = await Member.find();
    res.status(200).json({
      success: true,
    //   count: members.length,
      data: members,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch members",
      error: error.message,
    });
  }
};

// Add a new member
exports.createMember = async (req, res) => {
  try {
    const newMember = new Member(req.body);
    const savedMember = await newMember.save();
    res.status(201).json({
      success: true,
      message: "Member created successfully",
      data: savedMember,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating member",
      error: error.message,
    });
  }
};